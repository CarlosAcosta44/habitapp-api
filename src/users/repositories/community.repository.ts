import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/services/supabase.service';

/**
 * CommunityRepository
 * Responsable exclusivamente de interactuar con la base de datos (Supabase)
 * para todo lo relacionado con la comunidad: foros, comentarios, reacciones,
 * retos, especialistas, artículos y hábitos comunitarios.
 */
@Injectable()
export class CommunityRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  // ================= Foros =================

  async getForums() {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('foros')
      .select('*')
      .order('fechacreacion', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getUsersByIds(userIds: string[]) {
    const { data } = await this.client
      .schema('gestion')
      .from('usuarios')
      .select('idusuario, nombre, apellido')
      .in('idusuario', userIds);
    return data || [];
  }

  async getCommentCountsByForumIds(forumIds: string[]) {
    const { data } = await this.client
      .schema('comunidad')
      .from('comentarios')
      .select('idforo')
      .in('idforo', forumIds);
    return data || [];
  }

  async getForumSubscriptions(forumIds: string[]) {
    const { data } = await this.client
      .schema('comunidad')
      .from('usuario_foro')
      .select('idforo, idusuario')
      .in('idforo', forumIds);
    return data || [];
  }

  async createForum(userId: string, titulo: string, descripcion: string, categoria: string, imagenUrl?: string) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('foros')
      .insert({
        titulo: titulo.length > 200 ? titulo.substring(0, 200) : titulo,
        descripcion: descripcion.length > 200 ? descripcion.substring(0, 200) : descripcion,
        categoria,
        imagen_url: imagenUrl || null,
        idusuario: userId,
        estado: 'Abierto',
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getForumOwner(forumId: string) {
    const { data } = await this.client
      .schema('comunidad')
      .from('foros')
      .select('idusuario')
      .eq('idforo', forumId)
      .single();
    return data;
  }

  async updateForum(forumId: string, updates: { titulo?: string; descripcion?: string; categoria?: string; imagenUrl?: string }) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('foros')
      .update({
        titulo: updates.titulo,
        descripcion: updates.descripcion,
        categoria: updates.categoria,
        imagen_url: updates.imagenUrl,
      })
      .eq('idforo', forumId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deleteForum(forumId: string) {
    const { error } = await this.client
      .schema('comunidad')
      .from('foros')
      .delete()
      .eq('idforo', forumId);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  // ================= Comentarios =================

  async getCommentsByForumId(forumId: string) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('comentarios')
      .select('*')
      .eq('idforo', forumId)
      .order('fechapublicacion', { ascending: true });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getCommentReactions(commentIds: string[]) {
    const { data } = await this.client
      .schema('comunidad')
      .from('reacciones')
      .select('idcomentario, idusuario, tipo')
      .in('idcomentario', commentIds);
    return data || [];
  }

  async createComment(userId: string, forumId: string, contenido: string, parentId?: string, imagenUrl?: string) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('comentarios')
      .insert({
        contenido,
        idforo: forumId,
        idcomentario_padre: parentId || null,
        idusuario: userId,
        imagen_url: imagenUrl || null,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getCommentOwner(commentId: string) {
    const { data } = await this.client
      .schema('comunidad')
      .from('comentarios')
      .select('idusuario')
      .eq('idcomentario', commentId)
      .single();
    return data;
  }

  async updateComment(commentId: string, contenido: string, imagenUrl?: string) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('comentarios')
      .update({ contenido, imagen_url: imagenUrl })
      .eq('idcomentario', commentId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deleteComment(commentId: string) {
    const { error } = await this.client
      .schema('comunidad')
      .from('comentarios')
      .delete()
      .eq('idcomentario', commentId);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  // ================= Reacciones =================

  async getForumSubscription(forumId: string, userId: string) {
    const { data } = await this.client
      .schema('comunidad')
      .from('usuario_foro')
      .select('*')
      .match({ idforo: forumId, idusuario: userId })
      .maybeSingle();
    return data;
  }

  async addForumSubscription(forumId: string, userId: string) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('usuario_foro')
      .insert({ idforo: forumId, idusuario: userId })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async removeForumSubscription(forumId: string, userId: string) {
    const { error } = await this.client
      .schema('comunidad')
      .from('usuario_foro')
      .delete()
      .match({ idforo: forumId, idusuario: userId });

    if (error) throw new BadRequestException(error.message);
  }

  async getReaction(targetType: 'comentario' | 'articulo', targetId: string, userId: string, tipo: string) {
    const whereClause = targetType === 'comentario'
      ? { idcomentario: targetId }
      : { idarticulo: targetId };

    const { data } = await this.client
      .schema('comunidad')
      .from('reacciones')
      .select('idreaccion')
      .match({ ...whereClause, idusuario: userId, tipo })
      .maybeSingle();
    return data;
  }

  async addReaction(insertData: any) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('reacciones')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async removeReaction(reactionId: string) {
    const { error } = await this.client
      .schema('comunidad')
      .from('reacciones')
      .delete()
      .eq('idreaccion', reactionId);

    if (error) throw new BadRequestException(error.message);
  }

  // ================= Retos =================

  async getRetos() {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('retos')
      .select('*')
      .order('fechainicio', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async joinReto(userId: string, retoId: string) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('usuario_reto')
      .insert({ idusuario: userId, idreto: retoId, estado: 'En curso' })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new BadRequestException('Ya estás participando en este reto');
      throw new BadRequestException(error.message);
    }
    return data;
  }

  // ================= Especialistas =================

  async getCoachRoleId() {
    const { data, error } = await this.client
      .schema('gestion')
      .from('roles')
      .select('idrol')
      .eq('nombrerol', 'Entrenador')
      .single();

    if (error || !data) throw new BadRequestException('No se encontró el rol de Entrenador');
    return data.idrol;
  }

  async getUsersByRole(idrol: string) {
    const { data, error } = await this.client
      .schema('gestion')
      .from('usuarios')
      .select('idusuario, nombre, apellido, fotoperfil, genero')
      .eq('idrol', idrol)
      .eq('estado', 'Activo');

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getCoachSpecialties(userIds: string[]) {
    const { data } = await this.client
      .schema('seguimiento')
      .from('entrenadores')
      .select('idusuario, especialidad')
      .in('idusuario', userIds);
    return data || [];
  }

  // ================= Artículos =================

  async getArticulos() {
    const { data, error } = await this.client
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
    const { data, error } = await this.client
      .schema('comunidad')
      .from('habitos_publicados')
      .select('idpublicacion, nombre_habito, descripcion, meta_diaria, unidad_medida, likes, clones_count, idcategoria, idusuario')
      .order('fechapublicacion', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching community habits:', error.message);
      return [];
    }
    return data;
  }

  async getHabitCategories(categoryIds: any[]) {
    const { data, error } = await this.client
      .schema('seguimiento')
      .from('categorias_habitos')
      .select('idcategoria, nombre')
      .in('idcategoria', categoryIds);

    if (error) console.error('Error fetching categories:', error.message);
    return data || [];
  }

  async getPublishedHabit(idpublicacion: string) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('habitos_publicados')
      .select('*')
      .eq('idpublicacion', idpublicacion)
      .single();

    if (error || !data) throw new BadRequestException('Hábito comunitario no encontrado');
    return data;
  }

  async updateClonesCount(idpublicacion: string, newCount: number) {
    await this.client
      .schema('comunidad')
      .from('habitos_publicados')
      .update({ clones_count: newCount })
      .eq('idpublicacion', idpublicacion);
  }

  async createUserHabit(habitData: any) {
    const { data, error } = await this.client
      .schema('seguimiento')
      .from('habitos')
      .insert(habitData)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getUserHabit(idhabito: string, userId: string) {
    const { data, error } = await this.client
      .schema('seguimiento')
      .from('habitos')
      .select('*')
      .eq('idhabito', idhabito)
      .eq('idusuario', userId)
      .single();

    if (error || !data) throw new BadRequestException('Hábito no encontrado o no pertenece al usuario: ' + (error?.message || ''));
    return data;
  }

  async publishHabit(habitData: any) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('habitos_publicados')
      .insert(habitData)
      .select()
      .single();

    if (error) throw new BadRequestException(`No se pudo compartir: ${error.message}`);
    return data;
  }

  async getPublishedHabitOwner(idpublicacion: string) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('habitos_publicados')
      .select('idusuario')
      .eq('idpublicacion', idpublicacion)
      .single();

    if (error || !data) throw new BadRequestException('Hábito comunitario no encontrado');
    return data;
  }

  async deletePublishedHabit(idpublicacion: string) {
    const { error } = await this.client
      .schema('comunidad')
      .from('habitos_publicados')
      .delete()
      .eq('idpublicacion', idpublicacion);

    if (error) throw new BadRequestException(`No se pudo eliminar: ${error.message}`);
    return { success: true };
  }

  // ================= Storage / Upload =================

  async uploadImageToStorage(filePath: string, buffer: Buffer, mimetype: string): Promise<string> {
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
      .upload(filePath, buffer, { contentType: mimetype, upsert: true });

    if (uploadError) {
      throw new InternalServerErrorException(`Error al subir imagen al bucket: ${uploadError.message}`);
    }

    const { data } = client.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async validateUserToken(accessToken: string) {
    const { data: userData, error: userError } = await this.supabaseService.getClient().auth.getUser(accessToken);
    if (userError || !userData.user) throw new UnauthorizedException('No autenticado');
    return userData.user;
  }

  async validateUserTokenFromClient(accessToken: string) {
    const { createClient } = require('@supabase/supabase-js');
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const userClient = createClient(process.env.SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` }, fetch: require('node-fetch') },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) throw new UnauthorizedException('Token inválido');
    return userData.user;
  }
}
