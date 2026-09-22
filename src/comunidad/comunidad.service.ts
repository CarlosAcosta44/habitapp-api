import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ComunidadService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getClient(accessToken?: string) {
    if (accessToken) {
      const { createClient } = require('@supabase/supabase-js');
      const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
      return createClient(process.env.SUPABASE_URL, anonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          fetch: require('node-fetch'),
        },
      });
    }
    return this.supabaseService.getClient(); // Cliente con service_role
  }

  /** Decode a JWT and return the `sub` (user ID) without making any network call. */
  private decodeJwtUserId(token?: string): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
      return payload.sub || null;
    } catch {
      return null;
    }
  }

  // ================= Foros =================
  async getForums(accessToken?: string) {
    const { data, error } = await this.getClient().schema('comunidad').from('foros').select('*').order('fechacreacion', { ascending: false });
    if (error) throw new BadRequestException(error.message);

    // Fetch user details manually since cross-schema FK is missing
    const userIds = [...new Set(data.map((f: any) => f.idusuario).filter((id: any) => id))];
    if (userIds.length > 0) {
      const { data: usersData } = await this.getClient().schema('gestion').from('usuarios').select('idusuario, nombre, apellido').in('idusuario', userIds);
      const userMap: any = {};
      usersData?.forEach((u: any) => userMap[u.idusuario] = u);
      
      const forumIds = data.map((f: any) => f.idforo);
      const { data: commentsData } = await this.getClient().schema('comunidad').from('comentarios').select('idforo').in('idforo', forumIds);
      const commentCounts: any = {};
      commentsData?.forEach((c: any) => {
        commentCounts[c.idforo] = (commentCounts[c.idforo] || 0) + 1;
      });

      const { data: reactionsData } = await this.getClient().schema('comunidad').from('usuario_foro').select('idforo, idusuario').in('idforo', forumIds);
      const likesCounts: any = {};
      const likedByMe: any = {};
      
      let currentUserId = this.decodeJwtUserId(accessToken);

      reactionsData?.forEach((r: any) => {
        likesCounts[r.idforo] = (likesCounts[r.idforo] || 0) + 1;
        if (currentUserId && r.idusuario === currentUserId) {
          likedByMe[r.idforo] = true;
        }
      });

      data.forEach((f: any) => {
        f.usuarios = userMap[f.idusuario] || null;
        f.comments_count = commentCounts[f.idforo] || 0;
        f.likes_count = likesCounts[f.idforo] || 0;
        f.liked_by_me = likedByMe[f.idforo] || false;
      });
    }

    return data;
  }

  async getCommentsByForumId(forumId: string, accessToken?: string) {
    const { data, error } = await this.getClient()
      .schema('comunidad')
      .from('comentarios')
      .select('*')
      .eq('idforo', forumId)
      .order('fechapublicacion', { ascending: true });
    if (error) throw new BadRequestException(error.message);

    // Fetch user details manually since cross-schema FK is missing
    const userIds = [...new Set(data.map((c: any) => c.idusuario).filter((id: any) => id))];
    if (userIds.length > 0) {
      const { data: usersData } = await this.getClient().schema('gestion').from('usuarios').select('idusuario, nombre, apellido').in('idusuario', userIds);
      const userMap: any = {};
      usersData?.forEach((u: any) => userMap[u.idusuario] = u);
      const commentIds = data.map((c: any) => c.idcomentario);
      const { data: reactionsData } = await this.getClient().schema('comunidad').from('reacciones').select('idcomentario, idusuario, tipo').in('idcomentario', commentIds);
      const likesCounts: any = {};
      const likedByMe: any = {};
      
      let currentUserId = this.decodeJwtUserId(accessToken);

      reactionsData?.forEach((r: any) => {
        if ((r.tipo === 'LIKE' || r.tipo === 'Me gusta') && r.idcomentario) {
          likesCounts[r.idcomentario] = (likesCounts[r.idcomentario] || 0) + 1;
          if (currentUserId && r.idusuario === currentUserId) {
            likedByMe[r.idcomentario] = true;
          }
        }
      });

      data.forEach((c: any) => {
        c.usuarios = userMap[c.idusuario] || null;
        c.likes_count = likesCounts[c.idcomentario] || 0;
        c.liked_by_me = likedByMe[c.idcomentario] || false;
      });
    }

    return data;
  }

  async uploadImage(accessToken: string, file: Express.Multer.File): Promise<{ url: string }> {
    const { data: userData, error: userError } = await this.supabaseService.getClient().auth.getUser(accessToken);
    if (userError || !userData.user) throw new UnauthorizedException('No autenticado');
    const userId = userData.user.id;

    const fileExt = file.originalname.split('.').pop() || 'png';
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Need a service_role client to bypass RLS for uploads
    const { createClient } = require('@supabase/supabase-js');
    const client = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        global: {
          headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
          fetch: require('node-fetch'),
        },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );

    const { error: uploadError } = await client
      .storage.from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new InternalServerErrorException(`Error al subir imagen al bucket: ${uploadError.message}`);
    }

    const { data } = client.storage.from('avatars').getPublicUrl(filePath);
    return { url: data.publicUrl };
  }

  async createForum(userId: string, titulo: string, descripcion: string, categoria: string, imagenUrl?: string) {
    const { data, error } = await this.supabaseService.getClient().schema('comunidad').from('foros').insert({
      titulo: titulo.length > 200 ? titulo.substring(0, 200) : titulo,
      descripcion: descripcion.length > 200 ? descripcion.substring(0, 200) : descripcion,
      categoria,
      imagen_url: imagenUrl || null,
      idusuario: userId,
      estado: 'Abierto'
    }).select().single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateForum(userId: string, forumId: string, updates: { titulo?: string, descripcion?: string, categoria?: string, imagenUrl?: string }) {
    const serviceClient = this.supabaseService.getClient();
    const { data: forumData } = await serviceClient.schema('comunidad').from('foros').select('idusuario').eq('idforo', forumId).single();
    if (!forumData || forumData.idusuario !== userId) {
      throw new UnauthorizedException('No tienes permiso para editar este foro');
    }

    const { data, error } = await serviceClient.schema('comunidad').from('foros').update({
      titulo: updates.titulo,
      descripcion: updates.descripcion,
      categoria: updates.categoria,
      imagen_url: updates.imagenUrl,
    }).eq('idforo', forumId).select().single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deleteForum(userId: string, forumId: string) {
    const serviceClient = this.supabaseService.getClient();
    const { data: forumData } = await serviceClient.schema('comunidad').from('foros').select('idusuario').eq('idforo', forumId).single();
    if (!forumData || forumData.idusuario !== userId) {
      throw new UnauthorizedException('No tienes permiso para eliminar este foro');
    }

    const { error } = await serviceClient.schema('comunidad').from('foros').delete().eq('idforo', forumId);
    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  async addComment(userId: string, forumId: string, contenido: string, parentId?: string, imagenUrl?: string) {
    if (!contenido && !imagenUrl) throw new BadRequestException('El contenido o una imagen son requeridos');

    const { data, error } = await this.supabaseService.getClient().schema('comunidad').from('comentarios').insert({
      contenido,
      idforo: forumId,
      idcomentario_padre: parentId || null,
      idusuario: userId,
      imagen_url: imagenUrl || null,
    }).select().single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateComment(userId: string, commentId: string, contenido: string, imagenUrl?: string) {
    const serviceClient = this.supabaseService.getClient();
    const { data: commentData } = await serviceClient.schema('comunidad').from('comentarios').select('idusuario').eq('idcomentario', commentId).single();
    if (!commentData || commentData.idusuario !== userId) {
      throw new UnauthorizedException('No tienes permiso para editar este comentario');
    }

    const { data, error } = await serviceClient.schema('comunidad').from('comentarios').update({
      contenido,
      imagen_url: imagenUrl,
    }).eq('idcomentario', commentId).select().single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deleteComment(userId: string, commentId: string) {
    const serviceClient = this.supabaseService.getClient();
    const { data: commentData } = await serviceClient.schema('comunidad').from('comentarios').select('idusuario').eq('idcomentario', commentId).single();
    if (!commentData || commentData.idusuario !== userId) {
      throw new UnauthorizedException('No tienes permiso para eliminar este comentario');
    }

    const { error } = await serviceClient.schema('comunidad').from('comentarios').delete().eq('idcomentario', commentId);
    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  async addReaction(userId: string, targetType: 'comentario' | 'articulo' | 'foro', targetId: string, tipo: string) {
    const serviceClient = this.supabaseService.getClient();
    // Frontend sends 'LIKE', database expects 'Me gusta'
    const dbTipo = tipo === 'LIKE' ? 'Me gusta' : tipo;
    
    const insertData: any = {
      tipo: dbTipo,
      idusuario: userId,
    };
    
    if (targetType === 'foro') {
      // The reacciones table does not support idforo.
      // We will use usuario_foro to track "likes/subscriptions" on forums.
      const { data: existing } = await serviceClient.schema('comunidad').from('usuario_foro')
        .select('*').match({ idforo: targetId, idusuario: userId }).maybeSingle();
      
      if (existing) {
        const { error } = await serviceClient.schema('comunidad').from('usuario_foro')
          .delete().match({ idforo: targetId, idusuario: userId });
        if (error) throw new BadRequestException(error.message);
        return { toggled: 'removed' };
      }
      
      const { data, error } = await serviceClient.schema('comunidad').from('usuario_foro')
        .insert({ idforo: targetId, idusuario: userId }).select().single();
      if (error) throw new BadRequestException(error.message);
      return { toggled: 'added', data };
    }

    if (targetType === 'comentario') {
      insertData.idcomentario = targetId;
    } else if (targetType === 'articulo') {
      insertData.idarticulo = targetId;
    }

    // Toggle: if reaction exists delete it, otherwise insert
    const whereClause = targetType === 'comentario'
      ? { idcomentario: targetId }
      : { idarticulo: targetId };

    const { data: existing } = await serviceClient.schema('comunidad').from('reacciones')
      .select('idreaccion')
      .match({ ...whereClause, idusuario: userId, tipo: dbTipo })
      .maybeSingle();

    if (existing) {
      const { error: delError } = await serviceClient.schema('comunidad').from('reacciones')
        .delete()
        .eq('idreaccion', existing.idreaccion);
      if (delError) throw new BadRequestException(delError.message);
      return { toggled: 'removed' };
    }

    const { data, error } = await serviceClient.schema('comunidad').from('reacciones').insert(insertData).select().single();
    if (error) throw new BadRequestException(error.message);
    return { toggled: 'added', data };
  }

  // ================= Retos =================
  async getRetos() {
    const { data, error } = await this.getClient()
      .schema('comunidad')
      .from('retos')
      .select('*')
      .order('fechainicio', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async joinReto(accessToken: string, retoId: string) {
    const userClient = this.getClient(accessToken);
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) throw new UnauthorizedException('No autenticado');

    const { data, error } = await userClient.schema('comunidad').from('usuario_reto').insert({
      idusuario: userData.user.id,
      idreto: retoId,
      estado: 'En curso'
    }).select().single();

    if (error) {
      if (error.code === '23505') throw new BadRequestException('Ya estás participando en este reto');
      throw new BadRequestException(error.message);
    }
    return data;
  }

  // ================= Especialistas =================
  async getEspecialistas() {
    // Buscar el idrol de 'Entrenador'
    const { data: roleData, error: roleError } = await this.getClient()
      .schema('gestion')
      .from('roles')
      .select('idrol')
      .eq('nombrerol', 'Entrenador')
      .single();
    
    if (roleError || !roleData) throw new BadRequestException('No se encontró el rol de Entrenador');

    const { data, error } = await this.getClient()
      .schema('gestion')
      .from('usuarios')
      .select('idusuario, nombre, apellido, fotoperfil, genero')
      .eq('idrol', roleData.idrol)
      .eq('estado', 'Activo');
      
    if (error) throw new BadRequestException(error.message);

    const ids = data.map((u: any) => u.idusuario);
    if (ids.length > 0) {
      const { data: entrenadoresData } = await this.getClient()
        .schema('seguimiento')
        .from('entrenadores')
        .select('idusuario, especialidad')
        .in('idusuario', ids);

      if (entrenadoresData) {
        return data.map((u: any) => {
          const e = entrenadoresData.find((ed: any) => ed.idusuario === u.idusuario);
          return { ...u, especialidad: e?.especialidad || 'Especialista en Hábitos' };
        });
      }
    }

    return data;
  }

  // ================= Artículos =================
  async getArticulos() {
    const { data, error } = await this.getClient()
      .schema('comunidad')
      .from('articulos')
      .select('*')
      .eq('estado', 'Publicado')
      .order('fechapublicacion', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ================= Hábitos Comunitarios =================
  async getCommunityHabits() {
    // Fetch from comunidad.habitos_publicados and join with categorias_habitos
    const { data, error } = await this.getClient()
      .schema('comunidad')
      .from('habitos_publicados')
      .select('idpublicacion, nombre_habito, descripcion, meta_diaria, unidad_medida, likes, clones_count, idcategoria, idusuario')
      .order('fechapublicacion', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching community habits:', error.message);
      return [];
    }

    // Since we can't join across schemas directly via REST, we fetch category details
    const categoryIds = [...new Set(data.map((h: any) => h.idcategoria))];
    let categoriesMap: any = {};
    if (categoryIds.length > 0) {
      const { data: catData, error: catError } = await this.getClient()
        .schema('seguimiento')
        .from('categorias_habitos')
        .select('idcategoria, nombre')
        .in('idcategoria', categoryIds);
      
      if (catError) console.error('Error fetching categories:', catError.message);
      catData?.forEach((c: any) => categoriesMap[c.idcategoria] = c);
    }

    // Map the results
    return data.map((h: any) => {
      const cat = categoriesMap[h.idcategoria] || {};
      return {
        idhabito: h.idpublicacion, // frontend expects idhabito
        nombre: h.nombre_habito,
        descripcion: h.descripcion,
        meta_diaria: h.meta_diaria,
        unidad_medida: h.unidad_medida,
        puntos: h.likes || 0,
        idcategoria: h.idcategoria,
        idusuario: h.idusuario,
        clones_count: h.clones_count || 0,
        categoria_nombre: cat.nombre || 'General'
      };
    });
  }

  async cloneHabit(token: string, idhabito: string) {
    try {
      const supabase = this.getClient(token);
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user) throw new UnauthorizedException('Token inválido');
      
      const idusuario = userData.user.id;

      // 1. Obtener el hábito publicado original
      const { data: originalHabit, error: getError } = await supabase
        .schema('comunidad')
        .from('habitos_publicados')
        .select('*')
        .eq('idpublicacion', idhabito)
        .single();

      if (getError || !originalHabit) throw new BadRequestException('Hábito comunitario no encontrado');

      // 2. Incrementar el contador de clones
      await supabase.rpc('increment_clones_count', { row_id: idhabito });
      // Alternativa si RPC no existe: update con select previo (ya tenemos originalHabit.clones_count)
      await supabase.schema('comunidad').from('habitos_publicados')
        .update({ clones_count: (originalHabit.clones_count || 0) + 1 })
        .eq('idpublicacion', idhabito);

      // 3. Insertar el nuevo hábito para este usuario en seguimiento.habitos
      const newHabit = {
        nombre: originalHabit.nombre_habito,
        descripcion: originalHabit.descripcion,
        meta_diaria: originalHabit.meta_diaria,
        unidad_medida: originalHabit.unidad_medida,
        idcategoria: originalHabit.idcategoria,
        puntos: originalHabit.likes || 0,
        idusuario: idusuario,
        estado: 'Activo'
      };

      const { data, error } = await supabase
        .schema('seguimiento')
        .from('habitos')
        .insert(newHabit)
        .select()
        .single();

      if (error) throw new BadRequestException(error.message);
      return data;
    } catch (e: any) {
      throw new BadRequestException('Error al clonar: ' + e.message);
    }
  }

  // ================= Compartir Hábito =================
  async shareHabit(token: string, idhabito: string) {
    try {
      const supabase = this.getClient(token);
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user) throw new UnauthorizedException('Token inválido');
      
      // Obtener el hábito personal del usuario
      const { data: habito, error } = await supabase
        .schema('seguimiento')
        .from('habitos')
        .select('*')
        .eq('idhabito', idhabito)
        .eq('idusuario', userData.user.id)
        .single();

      if (error || !habito) throw new BadRequestException('Hábito no encontrado o no pertenece al usuario: ' + (error?.message || ''));

      // Insertar en habitos_publicados
      const { data: publicado, error: insertError } = await supabase
        .schema('comunidad')
        .from('habitos_publicados')
        .insert({
          nombre_habito: habito.nombre,
          descripcion: habito.descripcion,
          meta_diaria: habito.meta_diaria,
          unidad_medida: habito.unidad_medida,
          idcategoria: habito.idcategoria,
          likes: habito.puntos, // map puntos to likes
          dias_semana: habito.dias_semana || [1,2,3,4,5,6,7],
          idusuario: userData.user.id,
          clones_count: 0
        })
        .select()
        .single();

      if (insertError) throw new BadRequestException(`No se pudo compartir: ${insertError.message}`);
      return publicado;
    } catch (e: any) {
      throw new BadRequestException('Excepción atrapada: ' + e.message);
    }
  }

  // ================= Eliminar Hábito Compartido =================
  async deleteSharedHabit(token: string, idhabito: string) {
    try {
      const supabase = this.getClient(token);
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user) throw new UnauthorizedException('Token inválido');
      
      const { data: original, error: checkError } = await supabase
        .schema('comunidad')
        .from('habitos_publicados')
        .select('idusuario')
        .eq('idpublicacion', idhabito)
        .single();
        
      if (checkError || !original) throw new BadRequestException('Hábito comunitario no encontrado');
      if (original.idusuario !== userData.user.id) throw new UnauthorizedException('No tienes permiso para eliminar este hábito');

      const { error: deleteError } = await supabase
        .schema('comunidad')
        .from('habitos_publicados')
        .delete()
        .eq('idpublicacion', idhabito);

      if (deleteError) throw new BadRequestException(`No se pudo eliminar: ${deleteError.message}`);
      return { success: true };
    } catch (e: any) {
      throw new BadRequestException('Excepción atrapada al eliminar: ' + e.message);
    }
  }
}
