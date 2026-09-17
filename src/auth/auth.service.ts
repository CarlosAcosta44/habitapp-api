import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(dto: RegisterDto) {
    const { data, error } = await this.supabaseService.getClient().auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        nombre: dto.nombre,
        apellido: dto.apellido,
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Usuario registrado exitosamente.',
      user: data.user,
    };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      message: 'Inicio de sesión exitoso',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('El refresh_token es requerido');
    }
    
    const { data, error } = await this.supabaseService.getClient().auth.refreshSession({ refresh_token: refreshToken });
    
    if (error || !data.session) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    return {
      message: 'Token refrescado exitosamente',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }

  async logout(accessToken: string) {
    if (!accessToken) return;
    // En Supabase el logout invalida el refresh token del lado del servidor
    // Usamos el cliente para llamar al API con el token actual (opcional dependiendo de si se requiere)
    // Para simplificar, asumiremos que si hay token se invalida
    const { error } = await this.supabaseService.getClient().auth.admin.signOut(accessToken, 'global');
    if (error) {
      console.error('Logout error:', error.message);
    }
  }

  async resetPassword(email: string) {
    const { error } = await this.supabaseService.getClient().auth.resetPasswordForEmail(email, {
      redirectTo: process.env.FRONTEND_URL + '/reset-password',
    });
    if (error) {
      throw new BadRequestException(error.message);
    }
    return { message: 'Correo de recuperación enviado exitosamente.' };
  }

  async updatePassword(password: string) {
    const { error } = await this.supabaseService.getClient().auth.updateUser({ password });
    if (error) {
      throw new BadRequestException(error.message);
    }
    return { message: 'Contraseña actualizada exitosamente.' };
  }
}
