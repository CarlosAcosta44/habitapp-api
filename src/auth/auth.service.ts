import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(dto: RegisterDto) {
    const { data, error } = await this.supabaseService.getClient().auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
        },
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
}
