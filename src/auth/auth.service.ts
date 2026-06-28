import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(dto: AuthCredentialsDto) {
    const { data, error } = await this.supabaseService.getClient().auth.signUp({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Usuario registrado exitosamente',
      user: data.user,
      session: data.session,
    };
  }

  async login(dto: AuthCredentialsDto) {
    const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new UnauthorizedException('Credenciales inválidas: ' + error.message);
    }

    return {
      message: 'Inicio de sesión exitoso',
      user: data.user,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    };
  }
}
