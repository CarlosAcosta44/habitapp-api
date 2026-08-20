import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class FriendsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async existsRelation(userId: string, targetUserId: string): Promise<boolean> {
    const { data, error } = await this.client
      .schema('gestion')
      .from('amigos')
      .select('idamistad')
      .or(
        `and(idusuario_solicitante.eq.${userId},idusuario_receptor.eq.${targetUserId}),` +
          `and(idusuario_solicitante.eq.${targetUserId},idusuario_receptor.eq.${userId})`,
      )
      .limit(1);

    if (error) {
      throw new InternalServerErrorException(
        `Error al validar amistad existente: ${error.message}`,
      );
    }
    return (data ?? []).length > 0;
  }

  async createAcceptedRelation(
    userId: string,
    targetUserId: string,
  ): Promise<void> {
    const { error } = await this.client
      .schema('gestion')
      .from('amigos')
      .insert({
        idusuario_solicitante: userId,
        idusuario_receptor: targetUserId,
        estado: 'Aceptado',
      });

    if (error) {
      if (error.code === '23505') {
        throw new InternalServerErrorException(
          'Ya tienes una relación de amistad con este usuario',
        );
      }
      throw new InternalServerErrorException(
        `Error al agregar amigo: ${error.message}`,
      );
    }
  }

  async getAcceptedFriends(userId: string) {
    const { data: misAmistades, error: amistadError } = await this.client
      .from('api_amigos')
      .select('*')
      .eq('estado', 'Aceptado')
      .or(`idusuario_solicitante.eq.${userId},idusuario_receptor.eq.${userId}`);

    if (amistadError) {
      throw new InternalServerErrorException(
        `Error al obtener amistades: ${amistadError.message}`,
      );
    }

    const amigosIds = (misAmistades ?? []).map((a: any) =>
      a.idusuario_solicitante === userId
        ? a.idusuario_receptor
        : a.idusuario_solicitante,
    );

    if (amigosIds.length === 0) return [];

    const { data: perfilesAmigos, error: perfilesError } = await this.client
      .from('perfiles_usuarios_api')
      .select('idusuario, nombre, apellido, puntostotales')
      .in('idusuario', amigosIds)
      .order('puntostotales', { ascending: false });

    if (perfilesError) {
      throw new InternalServerErrorException(
        `Error al obtener perfiles de amigos: ${perfilesError.message}`,
      );
    }

    return (perfilesAmigos ?? []).map((pa: any, idx: number) => ({
      id: pa.idusuario,
      nombre: pa.nombre,
      apellido: pa.apellido,
      puntos: pa.puntostotales,
      top: idx === 0 && pa.puntostotales > 0,
    }));
  }

  async getFriendSuggestions(userId: string, limit = 12) {
    const { data: misAmistades, error: amistadError } = await this.client
      .from('api_amigos')
      .select('idusuario_solicitante, idusuario_receptor')
      .or(`idusuario_solicitante.eq.${userId},idusuario_receptor.eq.${userId}`);

    if (amistadError) {
      throw new InternalServerErrorException(
        `Error al obtener amistades: ${amistadError.message}`,
      );
    }

    const amigosExistentes = new Set(
      (misAmistades ?? []).map((a: any) =>
        a.idusuario_solicitante === userId
          ? a.idusuario_receptor
          : a.idusuario_solicitante,
      ),
    );

    const { data: sugerenciasRaw, error: perfilesError } = await this.client
      .from('perfiles_usuarios_api')
      .select('idusuario, nombre, apellido')
      .neq('idusuario', userId)
      .limit(40);

    if (perfilesError) {
      throw new InternalServerErrorException(
        `Error al obtener sugerencias: ${perfilesError.message}`,
      );
    }

    return (sugerenciasRaw ?? [])
      .filter((u: any) => !amigosExistentes.has(u.idusuario))
      .slice(0, limit)
      .map((u: any) => ({
        id: u.idusuario,
        nombre: u.nombre || 'Usuario',
        apellido: u.apellido || '',
      }));
  }

  async targetUserExists(targetUserId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('perfiles_usuarios_api')
      .select('idusuario')
      .eq('idusuario', targetUserId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  }
}
