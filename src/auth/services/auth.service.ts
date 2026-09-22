import { Injectable, BadRequestException } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthRepository } from '../repositories/auth.repository';

/**
 * AuthService
 * Capa de negocio de autenticación. Orquesta el flujo de autenticación
 * delegando todas las llamadas a Supabase Auth al AuthRepository.
 */
@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(dto: RegisterDto) {
    const user = await this.authRepository.createUser(dto.email, dto.password, {
      nombre: dto.nombre,
      apellido: dto.apellido,
      genero: dto.genero,
      fechanacimiento: dto.fechanacimiento,
    });

    return {
      message: 'Usuario registrado exitosamente.',
      user,
    };
  }

  async login(dto: LoginDto) {
    const data = await this.authRepository.signInWithPassword(dto.email, dto.password);
    return {
      message: 'Inicio de sesión exitoso',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }

  async loginWithGoogle(idToken: string) {
    const data = await this.authRepository.signInWithIdToken('google', idToken);
    return {
      message: 'Inicio de sesión con Google exitoso',
      access_token: data.session!.access_token,
      refresh_token: data.session!.refresh_token,
      user: data.user,
    };
  }

  async loginWithFacebook(accessToken: string) {
    const data = await this.authRepository.signInWithIdToken('facebook', accessToken);
    return {
      message: 'Inicio de sesión con Facebook exitoso',
      access_token: data.session!.access_token,
      refresh_token: data.session!.refresh_token,
      user: data.user,
    };
  }

  async linkWithGoogle(accessToken: string, idToken: string) {
    const userClient = this.authRepository.createUserClient(accessToken);
    const { data, error } = await userClient.auth.linkIdentity({ provider: 'google', token: idToken });
    if (error) throw new BadRequestException(error.message || 'Error al vincular con Google');
    return { message: 'Cuenta de Google vinculada exitosamente.', user: data.user };
  }

  async linkWithFacebook(accessToken: string, token: string) {
    const userClient = this.authRepository.createUserClient(accessToken);
    const { data, error } = await userClient.auth.linkIdentity({ provider: 'facebook', token });
    if (error) throw new BadRequestException(error.message || 'Error al vincular con Facebook');
    return { message: 'Cuenta de Facebook vinculada exitosamente.', user: data.user };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('El refresh_token es requerido');
    const data = await this.authRepository.refreshSession(refreshToken);
    return {
      message: 'Token refrescado exitosamente',
      access_token: data.session!.access_token,
      refresh_token: data.session!.refresh_token,
      user: data.user,
    };
  }

  async logout(accessToken: string) {
    if (!accessToken) return;
    await this.authRepository.signOut(accessToken);
  }

  async resetPassword(email: string) {
    await this.authRepository.resetPasswordForEmail(email, process.env.FRONTEND_URL + '/reset-password');
    return { message: 'Correo de recuperación enviado exitosamente.' };
  }

  async updatePassword(password: string) {
    await this.authRepository.updatePassword(password);
    return { message: 'Contraseña actualizada exitosamente.' };
  }
}
