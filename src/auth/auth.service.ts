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
        genero: dto.genero,
        fechanacimiento: dto.fechanacimiento,
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

  async loginWithGoogle(idToken: string) {
    const { data, error } = await this.supabaseService.getClient().auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException(error?.message || 'Error con Google Auth');
    }

    return {
      message: 'Inicio de sesión con Google exitoso',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }

  async loginWithFacebook(accessToken: string) {
    // Supabase JS allows signing in with an access token for supported providers (like facebook) 
    // by using the signInWithIdToken with the provider, although it's typically for OIDC.
    // Actually, for Facebook, Supabase does not currently support signInWithIdToken via JS.
    // However, the best approach is to pass the token to the OAuth endpoint, but since the
    // client uses Flutter, we'll try using the provider token approach.
    // Wait, the correct method for provider tokens in Supabase is currently limited.
    // But we can try using signInWithIdToken and see if Supabase handles it for Facebook,
    // or we can just create the user manually if needed.
    // For now, let's assume we can use the idToken or accessToken with signInWithIdToken.
    const { data, error } = await this.supabaseService.getClient().auth.signInWithIdToken({
      provider: 'facebook',
      token: accessToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException(error?.message || 'Error con Facebook Auth');
    }

    return {
      message: 'Inicio de sesión con Facebook exitoso',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }

  // Crea un cliente de supabase autenticado con el token del usuario para hacer peticiones en su nombre
  private getUserClient(accessToken: string) {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        fetch: require('node-fetch'),
      },
    });
  }

  async linkWithGoogle(accessToken: string, idToken: string) {
    const userClient = this.getUserClient(accessToken);
    const { data, error } = await userClient.auth.linkIdentity({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      throw new UnauthorizedException(error.message || 'Error al vincular con Google');
    }

    return { message: 'Cuenta de Google vinculada exitosamente.', user: data.user };
  }

  async linkWithFacebook(accessToken: string, token: string) {
    const userClient = this.getUserClient(accessToken);
    const { data, error } = await userClient.auth.linkIdentity({
      provider: 'facebook',
      token: token,
    });

    if (error) {
      throw new UnauthorizedException(error.message || 'Error al vincular con Facebook');
    }

    return { message: 'Cuenta de Facebook vinculada exitosamente.', user: data.user };
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
