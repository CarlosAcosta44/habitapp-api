import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CommunityService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getForums(userId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .schema('comunidad')
      .from('foros')
      .select(
        `
        idforo,
        titulo,
        descripcion,
        categoria,
        estado,
        fechacreacion,
        comentarios!idforo ( idcomentario ),
        usuario_foro!idforo ( idusuario )
      `,
      )
      .eq('estado', 'Abierto')
      .order('fechacreacion', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data || []).map((row: any) => ({
      idForo: row.idforo,
      titulo: row.titulo,
      descripcion: row.descripcion,
      categoria: row.categoria,
      estado: row.estado,
      fechaCreacion: row.fechacreacion,
      totalComentarios: row.comentarios?.length ?? 0,
      totalSuscriptores: row.usuario_foro?.length ?? 0,
      estasSuscrito: (row.usuario_foro || []).some(
        (s: any) => s.idusuario === userId,
      ),
    }));
  }

  async getComments(forumId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .schema('comunidad')
      .from('comentarios')
      .select(
        `
        idcomentario,
        contenido,
        fechapublicacion,
        idcomentario_padre,
        idforo,
        idusuario,
        reacciones!idcomentario (
          tipo
        )
      `,
      )
      .eq('idforo', forumId)
      .order('fechapublicacion', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    // Extraer IDs únicos de usuarios
    const userIds = [
      ...new Set((data || []).map((row: any) => row.idusuario)),
    ].filter(Boolean);
    let usuariosMap: any = {};

    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await client
        .schema('gestion')
        .from('usuarios')
        .select('idusuario, nombre, apellido, fotoperfil')
        .in('idusuario', userIds);

      if (!usersError && usersData) {
        usuariosMap = usersData.reduce((acc: any, curr: any) => {
          acc[curr.idusuario] = curr;
          return acc;
        }, {});
      }
    }

    const todos = (data || []).map((row: any) => {
      const reacciones = row.reacciones || [];
      const user = usuariosMap[row.idusuario] || {};

      return {
        idComentario: row.idcomentario,
        contenido: row.contenido,
        fechaPublicacion: row.fechapublicacion,
        idComentarioPadre: row.idcomentario_padre,
        idForo: row.idforo,
        idUsuario: row.idusuario,
        autor: {
          nombre: user.nombre ?? '',
          apellido: user.apellido ?? '',
          fotoPerfil: user.fotoperfil ?? null,
        },
        reacciones: {
          meGusta: reacciones.filter((r: any) => r.tipo === 'Me gusta').length,
          meMotiva: reacciones.filter((r: any) => r.tipo === 'Me motiva')
            .length,
          util: reacciones.filter((r: any) => r.tipo === 'Util').length,
        },
        respuestas: [],
      };
    });

    // Anidar respuestas
    const padres = todos.filter((c: any) => !c.idComentarioPadre);
    const hijos = todos.filter((c: any) => c.idComentarioPadre);

    return padres.map((padre: any) => ({
      ...padre,
      respuestas: hijos.filter(
        (hijo: any) => hijo.idComentarioPadre === padre.idComentario,
      ),
    }));
  }

  async createComment(dto: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .schema('comunidad')
      .from('comentarios')
      .insert({
        contenido: dto.contenido,
        idcomentario_padre: dto.idComentarioPadre ?? null,
        idforo: dto.idForo,
        idusuario: dto.idUsuario,
      })
      .select('*')
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      idComentario: data.idcomentario,
      contenido: data.contenido,
      fechaPublicacion: data.fechapublicacion,
      idComentarioPadre: data.idcomentario_padre,
      idForo: data.idforo,
      idUsuario: data.idusuario,
    };
  }

  async toggleReaction(dto: any) {
    const client = this.supabaseService.getClient();

    let queryExistente = client
      .schema('comunidad')
      .from('reacciones')
      .select('idreaccion')
      .eq('idusuario', dto.idUsuario);

    if (dto.idComentario) {
      queryExistente = queryExistente.eq('idcomentario', dto.idComentario);
    } else if (dto.idArticulo) {
      queryExistente = queryExistente.eq('idarticulo', dto.idArticulo);
    }

    const { data: existente } = await queryExistente.single();

    if (existente) {
      const { error } = await client
        .schema('comunidad')
        .from('reacciones')
        .delete()
        .eq('idreaccion', existente.idreaccion);
      if (error) throw new InternalServerErrorException(error.message);
      return false; // false = deleted
    }

    const { error } = await client
      .schema('comunidad')
      .from('reacciones')
      .insert({
        tipo: dto.tipo,
        idusuario: dto.idUsuario,
        idcomentario: dto.idComentario ?? null,
        idarticulo: dto.idArticulo ?? null,
      });

    if (error) throw new InternalServerErrorException(error.message);
    return true; // true = created
  }

  async subscribeToForum(userId: string, forumId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .schema('comunidad')
      .from('usuario_foro')
      .insert({ idusuario: userId, idforo: forumId });

    if (error) throw new InternalServerErrorException(error.message);
    return true;
  }

  async unsubscribeFromForum(userId: string, forumId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .schema('comunidad')
      .from('usuario_foro')
      .delete()
      .eq('idusuario', userId)
      .eq('idforo', forumId);

    if (error) throw new InternalServerErrorException(error.message);
    return true;
  }

  async getArticles(limit?: number) {
    const client = this.supabaseService.getClient();
    let query = client
      .schema('comunidad')
      .from('articulos')
      .select('*')
      .eq('estado', 'Publicado')
      .order('fechapublicacion', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);

    return (data || []).map((row: any) => ({
      idArticulo: row.idarticulo,
      titulo: row.titulo,
      contenido: row.contenido,
      categoria: row.categoria,
      estado: row.estado,
      fechaPublicacion: row.fechapublicacion,
    }));
  }

  async getTrainers() {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .schema('seguimiento')
      .from('entrenadores')
      .select(
        `
        identrenador,
        idusuario,
        especialidad,
        certificacion
      `,
      )
      .limit(6);

    if (error) throw new InternalServerErrorException(error.message);

    const userIds = [
      ...new Set((data || []).map((row: any) => row.idusuario)),
    ].filter(Boolean);
    let usuariosMap: any = {};
    if (userIds.length > 0) {
      const { data: usersData } = await client
        .schema('gestion')
        .from('usuarios')
        .select('idusuario, nombre, apellido, fotoperfil')
        .in('idusuario', userIds);

      if (usersData) {
        usuariosMap = usersData.reduce((acc: any, curr: any) => {
          acc[curr.idusuario] = curr;
          return acc;
        }, {});
      }
    }

    return (data || []).map((row: any) => {
      const user = usuariosMap[row.idusuario] || {};
      return {
        idEntrenador: row.identrenador,
        nombre: user.nombre ?? '',
        apellido: user.apellido ?? '',
        fotoPerfil: user.fotoperfil ?? null,
        especialidad: row.especialidad,
        certificacion: row.certificacion,
      };
    });
  }
}
