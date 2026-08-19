import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async storeRefreshToken(
    userId: string,
    tokenHash: string,
    familyId: string,
    expiresAt: Date,
  ) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('refresh_tokens')
      .insert({
        idusuario: userId,
        token_hash: tokenHash,
        family_id: familyId,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      throw new InternalServerErrorException(
        `Error saving refresh token: ${error.message}`,
      );
    }
  }

  async findRefreshToken(tokenHash: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('refresh_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new InternalServerErrorException(
        `Error fetching refresh token: ${error.message}`,
      );
    }

    return data || null;
  }

  async revokeRefreshToken(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error revoking token: ${error.message}`,
      );
    }
  }

  async revokeTokenFamily(familyId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('family_id', familyId);

    if (error) {
      throw new InternalServerErrorException(
        `Error revoking token family: ${error.message}`,
      );
    }
  }

  async storeVerificationToken(
    userId: string,
    tokenHash: string,
    type: 'verificacion_email' | 'reset_password',
    expiresAt: Date,
  ) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('verificacion_tokens')
      .insert({
        idusuario: userId,
        token_hash: tokenHash,
        tipo: type,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      throw new InternalServerErrorException(
        `Error saving verification token: ${error.message}`,
      );
    }
  }

  async findVerificationToken(tokenHash: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('verificacion_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new InternalServerErrorException(
        `Error fetching verification token: ${error.message}`,
      );
    }

    return data || null;
  }

  async markVerificationTokenUsed(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('verificacion_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error updating verification token: ${error.message}`,
      );
    }
  }
}
