import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { AuthRepository } from './repositories/auth.repository';
import { UsersRepository } from '../users/repositories/users.repository';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private usersRepository: UsersRepository,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user || !user.password_hash) {
      return null;
    }

    if (user.estado_cuenta === 'Suspendido') {
      throw new UnauthorizedException('Su cuenta ha sido suspendida.');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash: _password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.idusuario,
      role: user.nombrerol,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') ||
        'default-access-secret',
      expiresIn: '15m',
    });

    const refreshToken = uuidv4();
    const refreshHash = this.hashToken(refreshToken);
    const familyId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.storeRefreshToken(
      user.idusuario,
      refreshHash,
      familyId,
      expiresAt,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.idusuario,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.nombrerol,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('El correo ya está en uso');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const roleId = await this.usersRepository.getDefaultRoleId();

    const newUser = await this.usersRepository.createLocalUser({
      email: dto.email,
      password_hash: passwordHash,
      nombre: dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
      genero: dto.genero,
      fechanacimiento: dto.fechanacimiento,
      idrol: roleId,
      estado_cuenta: 'Activo',
      estado: 'Activo',
      puntostotales: 0,
    });

    const verificationToken = uuidv4();
    const verificationHash = this.hashToken(verificationToken);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.authRepository.storeVerificationToken(
      newUser.idusuario,
      verificationHash,
      'verificacion_email',
      expiresAt,
    );
    await this.mailService.sendVerificationEmail(
      newUser.email,
      verificationToken,
    );

    return {
      message: 'Usuario registrado exitosamente. Por favor verifica tu correo.',
    };
  }

  async refreshToken(oldToken: string) {
    if (!oldToken)
      throw new UnauthorizedException('Refresh token no proporcionado');

    const tokenHash = this.hashToken(oldToken);
    const tokenRecord = await this.authRepository.findRefreshToken(tokenHash);

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (tokenRecord.revoked_at) {
      await this.authRepository.revokeTokenFamily(tokenRecord.family_id);
      throw new UnauthorizedException(
        'Reutilización de token detectada. Familia revocada.',
      );
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    await this.authRepository.revokeRefreshToken(tokenRecord.id);

    const user = await this.usersRepository.findProfileById(
      tokenRecord.idusuario,
    );
    return this.login(user);
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.authRepository.findRefreshToken(tokenHash);

    if (tokenRecord && !tokenRecord.revoked_at) {
      await this.authRepository.revokeRefreshToken(tokenRecord.id);
    }
  }
}
