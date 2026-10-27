
import { Injectable, UnauthorizedException, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import type { IUserRepository } from '../../users/interfaces/user.repository.interface';
import { MailService } from '../../../core/mail/services/mail.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy');
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new BadRequestException('El correo ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const idrol = await this.userRepository.getDefaultRoleId();

    const user = await this.userRepository.create({
      idusuario: crypto.randomUUID(),
      email: dto.email,
      password_hash: hashedPassword,
      nombre: dto.nombre,
      apellido: dto.apellido,
      genero: dto.genero,
      fechanacimiento: dto.fechanacimiento,
      telefono: dto.telefono,
      estado_cuenta: 'Activo',
      estado: 'Activo',
      idrol: idrol
    });

    return { message: 'Usuario registrado exitosamente', user };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.password_hash) throw new UnauthorizedException('Credenciales inválidas');

    const isValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isValid) throw new UnauthorizedException('Credenciales inválidas');

    if (user.estado_cuenta === 'Suspendido') {
      throw new ForbiddenException('Tu cuenta se encuentra suspendida. Contacta al administrador.');
    }

    const payload = { sub: user.idusuario, email: user.email, rol: user.idrol };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshPayload = { sub: user.idusuario, email: user.email, token_type: 'refresh' };
    const refresh_token = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });

    return {
      message: 'Inicio de sesión exitoso',
      access_token,
      refresh_token,
      expires_in: 900,
      user,
    };
  }

  async refreshToken(token?: string) {
    if (!token) {
      throw new UnauthorizedException('Refresh token expirado o inválido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (!payload || !payload.sub || payload.token_type !== 'refresh') {
        throw new UnauthorizedException('Refresh token expirado o inválido');
      }

      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Refresh token expirado o inválido');
      }

      if (user.estado_cuenta === 'Suspendido') {
        throw new ForbiddenException('Tu cuenta se encuentra suspendida. Contacta al administrador.');
      }

      const accessPayload = { sub: user.idusuario, email: user.email, rol: user.idrol };
      const access_token = this.jwtService.sign(accessPayload, { expiresIn: '15m' });
      const refreshPayload = { sub: user.idusuario, email: user.email, token_type: 'refresh' };
      const new_refresh_token = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });

      return {
        message: 'Token renovado exitosamente',
        access_token,
        refresh_token: new_refresh_token,
        expires_in: 900,
        user,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Refresh token expirado o inválido');
    }
  }
  
  async logout(userId: string) {
    return { message: 'Sesión terminada' };
  }

  // --- OAUTH GOOGLE ---
  async loginWithGoogle(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) throw new UnauthorizedException('Token inválido');
      return this.handleOAuthLogin(payload.email, payload.given_name || '', payload.family_name || '');
    } catch (error) {
      throw new UnauthorizedException('Token de Google inválido');
    }
  }

  // --- OAUTH FACEBOOK ---
  async loginWithFacebook(accessToken: string) {
    try {
      const { data } = await axios.get(
        `https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token=${accessToken}`
      );
      if (!data.email) throw new BadRequestException('La cuenta de Facebook no tiene un email público');
      return this.handleOAuthLogin(data.email, data.first_name, data.last_name);
    } catch (error) {
      throw new UnauthorizedException('Token de Facebook inválido');
    }
  }

  private async handleOAuthLogin(email: string, firstName: string, lastName: string) {
    let user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      const idrol = await this.userRepository.getDefaultRoleId();
      user = await this.userRepository.create({
        idusuario: crypto.randomUUID(),
        email: email,
        nombre: firstName || 'Usuario',
        apellido: lastName || '',
        estado_cuenta: 'Activo',
        estado: 'Activo',
        idrol: idrol
      });
    }

    const payload = { sub: user.idusuario, email: user.email, rol: user.idrol };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshPayload = { sub: user.idusuario, email: user.email, token_type: 'refresh' };
    const refresh_token = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });

    return {
      message: 'Autenticación exitosa',
      access_token,
      refresh_token,
      expires_in: 900,
      user,
    };
  }

  // --- PASSWORD RESET ---
  async resetPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Return success anyway to prevent email enumeration
      return { message: 'Si el correo existe, se enviarán las instrucciones.' };
    }
    
    // Generate a short-lived token specifically for password reset
    const token = this.jwtService.sign(
      { sub: user.idusuario, email: user.email, intent: 'reset' },
      { expiresIn: '15m' } 
    );
    
    await this.mailService.sendPasswordResetEmail(email, token);
    return { message: 'Si el correo existe, se enviarán las instrucciones.' };
  }

  async updatePassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.intent !== 'reset') throw new UnauthorizedException('Token inválido');
      
      const user = await this.userRepository.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the password via the Supabase Service in the repository
      // Let's assume we have an update method or we just do it here temporarily
      // Wait, we need an update method in IUserRepository!
      await this.userRepository.update(user.idusuario, { password_hash: hashedPassword });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (e) {
      throw new UnauthorizedException('El enlace expiró o es inválido');
    }
  }
}
