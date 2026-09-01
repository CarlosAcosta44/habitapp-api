import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
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

  async login(user: any): Promise<{ access_token: string; refresh_token: string; user: { id: string; email: string; nombre: string; apellido: string; rol: string } }> {
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

    try {
      await this.authRepository.storeRefreshToken(
        user.idusuario,
        refreshHash,
        familyId,
        expiresAt,
      );
    } catch (error) {
      console.warn('⚠️ No se pudo guardar el refresh token (problema de permisos BD):', error.message);
    }

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
      idusuario: uuidv4(),
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

    try {
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
    } catch (error) {
      console.warn('⚠️ No se pudo guardar el token de verificación o enviar el email (probablemente falta configurar Resend o permisos en BD):', error.message);
    }

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

  // ─── OAuth Mobile ──────────────────────────────────────────────────────────

  /**
   * Verifica un ID Token de Google recibido desde la app móvil.
   */
  async verifyGoogleTokenMobile(idToken: string): Promise<{ access_token: string; refresh_token: string; user: { id: string; email: string; nombre: string; apellido: string; rol: string } }> {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) throw new UnauthorizedException('Token de Google inválido');

    return this.findOrCreateOAuthUser({
      provider: 'google',
      providerId: payload.sub,
      email: payload.email ?? '',
      nombre: payload.given_name || payload.name || 'Usuario',
      apellido: payload.family_name || '',
      fotoperfil: payload.picture || null,
      emailVerified: payload.email_verified || false,
    });
  }

  /**
   * Verifica un Token de Apple recibido desde la app móvil.
   */
  async verifyAppleTokenMobile(identityToken: string): Promise<{ access_token: string; refresh_token: string; user: { id: string; email: string; nombre: string; apellido: string; rol: string } }> {
    // TODO: Implementar verificación real del JWT de Apple usando apple-signin-auth
    throw new Error('El login con Apple está en construcción en el backend.');
  }

  // ─── OAuth Web ─────────────────────────────────────────────────────────────

  /**
   * Busca o crea un usuario a partir del perfil de Google.
   */
  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    nombre: string;
    apellido: string;
    fotoperfil: string | null;
    emailVerified: boolean;
  }) {
    return this.findOrCreateOAuthUser({
      provider: 'google',
      providerId: profile.googleId,
      email: profile.email,
      nombre: profile.nombre,
      apellido: profile.apellido,
      fotoperfil: profile.fotoperfil,
      emailVerified: profile.emailVerified,
    });
  }

  /**
   * Busca o crea un usuario a partir del perfil de Facebook.
   */
  async findOrCreateFacebookUser(profile: {
    facebookId: string;
    email: string;
    nombre: string;
    apellido: string;
    fotoperfil: string | null;
    emailVerified: boolean;
  }) {
    return this.findOrCreateOAuthUser({
      provider: 'facebook',
      providerId: profile.facebookId,
      email: profile.email,
      nombre: profile.nombre,
      apellido: profile.apellido,
      fotoperfil: profile.fotoperfil,
      emailVerified: profile.emailVerified,
    });
  }

  /**
   * Busca o crea un usuario a partir del perfil de Microsoft.
   */
  async findOrCreateMicrosoftUser(profile: {
    microsoftId: string;
    email: string;
    nombre: string;
    apellido: string;
    fotoperfil: string | null;
    emailVerified: boolean;
  }) {
    return this.findOrCreateOAuthUser({
      provider: 'microsoft',
      providerId: profile.microsoftId,
      email: profile.email,
      nombre: profile.nombre,
      apellido: profile.apellido,
      fotoperfil: profile.fotoperfil,
      emailVerified: profile.emailVerified,
    });
  }

  /**
   * Lógica compartida para encontrar o crear un usuario OAuth.
   * Seguridad: solo vincula si emailVerified = true (anti account-takeover).
   */
  private async findOrCreateOAuthUser(opts: { // eslint-disable-next-line @typescript-eslint/no-unused-vars
    provider: 'google' | 'facebook' | 'microsoft';
    providerId: string;
    email: string;
    nombre: string;
    apellido: string;
    fotoperfil: string | null;
    emailVerified: boolean;
  }) {
    // 1. ¿Ya existe una identidad del proveedor vinculada?
    const existingIdentity = await this.authRepository.findIdentityByProvider(
      opts.provider,
      opts.providerId,
    );

    if (existingIdentity) {
      const user = await this.usersRepository.findProfileById(
        existingIdentity.idusuario,
      );
      return this.login(user);
    }

    // 2. ¿Existe un usuario local con ese email?
    const existingUser = await this.usersRepository.findByEmail(opts.email);

    if (existingUser) {
      if (!opts.emailVerified) {
        throw new Error(
          `El email de ${opts.provider} no está verificado. No se puede vincular automáticamente.`,
        );
      }

      await this.authRepository.createOAuthIdentity({
        idusuario: existingUser.idusuario,
        provider: opts.provider,
        provider_id: opts.providerId,
        provider_email: opts.email,
      });

      return this.login(existingUser);
    }

    // 3. Usuario nuevo: crear cuenta + identidad OAuth
    const roleId = await this.usersRepository.getDefaultRoleId();
    const newUser = await this.usersRepository.createLocalUser({
      idusuario: uuidv4(),
      email: opts.email,
      password_hash: null, // cuenta OAuth, sin contraseña local
      nombre: opts.nombre,
      apellido: opts.apellido,
      fotoperfil: opts.fotoperfil,
      idrol: roleId,
      email_verified: opts.emailVerified,
      estado_cuenta: 'Activo',
      estado: 'Activo',
      puntostotales: 0,
    });

    await this.authRepository.createOAuthIdentity({
      idusuario: newUser.idusuario,
      provider: opts.provider,
      provider_id: opts.providerId,
      provider_email: opts.email,
    });

    return this.login(newUser);
  }
}
