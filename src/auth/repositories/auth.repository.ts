import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/services/supabase.service';

/**
 * AuthRepository
 * Encapsula todas las operaciones directas con la API de autenticación
 * de Supabase (admin.createUser, signInWithPassword, etc.) y cualquier
 * consulta de datos relacionada con auth.
 *
 * NOTE: En este caso, el "repositorio" envuelve la capa de Auth de Supabase,
 * no las tablas de la base de datos. Esto es arquitectónicamente correcto:
 * el Service orquesta el flujo y el Repository encapsula el acceso externo.
 */
@Injectable()
export class AuthRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createUser(email: string, password: string, metadata: Record<string, any>) {
    const { data, error } = await this.supabaseService.getClient().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) throw new BadRequestException(error.message);
    return data.user;
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({ email, password });

    if (error || !data.session) throw new UnauthorizedException('Credenciales inválidas');
    return data;
  }

  async signInWithIdToken(provider: 'google' | 'facebook', token: string) {
    const { data, error } = await this.supabaseService.getClient().auth.signInWithIdToken({ provider, token });

    if (error || !data.session) throw new UnauthorizedException(error?.message || `Error con ${provider} Auth`);
    return data;
  }

  async refreshSession(refreshToken: string) {
    const { data, error } = await this.supabaseService.getClient().auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) throw new UnauthorizedException('Refresh token inválido o expirado');
    return data;
  }

  async signOut(accessToken: string) {
    const { error } = await this.supabaseService.getClient().auth.admin.signOut(accessToken, 'global');
    if (error) console.error('Logout error:', error.message);
  }

  async resetPasswordForEmail(email: string, redirectTo: string) {
    const { error } = await this.supabaseService.getClient().auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new BadRequestException(error.message);
  }

  async updatePassword(password: string) {
    const { error } = await this.supabaseService.getClient().auth.updateUser({ password });
    if (error) throw new BadRequestException(error.message);
  }

  createUserClient(accessToken: string) {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
        fetch: require('node-fetch'),
      },
    });
  }
}
