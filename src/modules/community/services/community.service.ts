import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CommunityRepository } from '../repositories/community.repository';

/**
 * CommunityService
 * Capa de negocio. No interactúa con Supabase directamente; delega toda
 * la persistencia al CommunityRepository. Se encarga de:
 * - Orquestar múltiples llamadas al repositorio.
 * - Aplicar reglas de negocio (validar propiedad, permisos, toggle de likes, etc.).
 * - Transformar los datos para la respuesta al controlador.
 */
@Injectable()
export class CommunityService {
  constructor(private readonly communityRepository: CommunityRepository) {}

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

  async getForumById(forumId: string, accessToken?: string) {
    const forum = await this.communityRepository.getForumById(forumId);
    if (!forum) {
      throw new NotFoundException(`Foro con ID ${forumId} no encontrado`);
    }

    if (forum.idusuario) {
      const usersData = await this.communityRepository.getUsersByIds([forum.idusuario]);
      forum.usuarios = usersData[0] || null;
    }

    const commentsData = await this.communityRepository.getCommentCountsByForumIds([forumId]);
    forum.comments_count = commentsData.length;

    const reactionsData = await this.communityRepository.getForumSubscriptions([forumId]);
    forum.likes_count = reactionsData.length;

    const currentUserId = this.decodeJwtUserId(accessToken);
    forum.liked_by_me = currentUserId
      ? reactionsData.some((r: any) => r.idusuario === currentUserId)
      : false;

    return forum;
  }

  async getStats() {
    const totalMiembros = await this.communityRepository.getActiveUsersCount();
    return {
      totalMiembros,
      conectados: totalMiembros,
    };
  }

  async getForums(accessToken?: string) {
    const data = await this.communityRepository.getForums();

    const userIds = [...new Set(data.map((f: any) => f.idusuario).filter((id: any) => id))];
    if (userIds.length > 0) {
      const usersData = await this.communityRepository.getUsersByIds(userIds as string[]);
      const userMap: any = {};
      usersData.forEach((u: any) => userMap[u.idusuario] = u);

      const forumIds = data.map((f: any) => f.idforo);
      const commentsData = await this.communityRepository.getCommentCountsByForumIds(forumIds);
      const commentCounts: any = {};
      commentsData.forEach((c: any) => {
        commentCounts[c.idforo] = (commentCounts[c.idforo] || 0) + 1;
      });

      const reactionsData = await this.communityRepository.getForumSubscriptions(forumIds);
      const likesCounts: any = {};
      const likedByMe: any = {};
      const currentUserId = this.decodeJwtUserId(accessToken);

      reactionsData.forEach((r: any) => {
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
    const data = await this.communityRepository.getCommentsByForumId(forumId);

    const userIds = [...new Set(data.map((c: any) => c.idusuario).filter((id: any) => id))];
    if (userIds.length > 0) {
      const usersData = await this.communityRepository.getUsersByIds(userIds as string[]);
      const userMap: any = {};
      usersData.forEach((u: any) => userMap[u.idusuario] = u);

      const commentIds = data.map((c: any) => c.idcomentario);
      const reactionsData = await this.communityRepository.getCommentReactions(commentIds);
      const likesCounts: any = {};
      const likedByMe: any = {};
      const currentUserId = this.decodeJwtUserId(accessToken);

      reactionsData.forEach((r: any) => {
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

  async uploadImage(userId: string, file: Express.Multer.File): Promise<{ url: string }> {
    const fileExt = file.originalname?.split(".").pop() || "png";
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `community/${userId}/${fileName}`;
    const url = await this.communityRepository.uploadImageToStorage(filePath, file.buffer, file.mimetype);
    return { url };
  }

  async createForum(userId: string, titulo: string, descripcion: string, categoria: string, imagenUrl?: string) {
    return this.communityRepository.createForum(userId, titulo, descripcion, categoria, imagenUrl);
  }

  async updateForum(userId: string, forumId: string, updates: { titulo?: string; descripcion?: string; categoria?: string; imagenUrl?: string }) {
    const forumData = await this.communityRepository.getForumOwner(forumId);
    if (!forumData || forumData.idusuario !== userId) {
      throw new UnauthorizedException('No tienes permiso para editar este foro');
    }
    return this.communityRepository.updateForum(forumId, updates);
  }

  async deleteForum(userId: string, forumId: string) {
    const forumData = await this.communityRepository.getForumOwner(forumId);
    if (!forumData || forumData.idusuario !== userId) {
      throw new UnauthorizedException('No tienes permiso para eliminar este foro');
    }
    return this.communityRepository.deleteForum(forumId);
  }

  async addComment(userId: string, forumId: string, contenido: string, parentId?: string, imagenUrl?: string) {
    if (!contenido && !imagenUrl) throw new BadRequestException('El contenido o una imagen son requeridos');
    return this.communityRepository.createComment(userId, forumId, contenido, parentId, imagenUrl);
  }

  async updateComment(userId: string, commentId: string, contenido: string, imagenUrl?: string) {
    const commentData = await this.communityRepository.getCommentOwner(commentId);
    if (!commentData || commentData.idusuario !== userId) {
      throw new UnauthorizedException('No tienes permiso para editar este comentario');
    }
    return this.communityRepository.updateComment(commentId, contenido, imagenUrl);
  }

  async deleteComment(userId: string, commentId: string) {
    const commentData = await this.communityRepository.getCommentOwner(commentId);
    if (!commentData || commentData.idusuario !== userId) {
      throw new UnauthorizedException('No tienes permiso para eliminar este comentario');
    }
    return this.communityRepository.deleteComment(commentId);
  }

  async addReaction(userId: string, targetType: 'comentario' | 'articulo' | 'foro', targetId: string, tipo: string) {
    // Frontend sends 'LIKE', database expects 'Me gusta'
    const dbTipo = tipo === 'LIKE' ? 'Me gusta' : tipo;

    if (targetType === 'foro') {
      const existing = await this.communityRepository.getForumSubscription(targetId, userId);
      if (existing) {
        await this.communityRepository.removeForumSubscription(targetId, userId);
        return { toggled: 'removed' };
      }
      const data = await this.communityRepository.addForumSubscription(targetId, userId);
      return { toggled: 'added', data };
    }

    const insertData: any = { tipo: dbTipo, idusuario: userId };
    if (targetType === 'comentario') insertData.idcomentario = targetId;
    else if (targetType === 'articulo') insertData.idarticulo = targetId;

    const existing = await this.communityRepository.getReaction(targetType, targetId, userId, dbTipo);
    if (existing) {
      await this.communityRepository.removeReaction(existing.idreaccion);
      return { toggled: 'removed' };
    }

    const data = await this.communityRepository.addReaction(insertData);
    return { toggled: 'added', data };
  }

  // ================= Retos =================

  async getRetos() {
    return this.communityRepository.getRetos();
  }

  async joinReto(userId: string, retoId: string) {
    return this.communityRepository.joinReto(userId, retoId);
  }

  // ================= Especialistas =================

  async getEspecialistas() {
    const idrol = await this.communityRepository.getCoachRoleId();
    const users = await this.communityRepository.getUsersByRole(idrol);

    const ids = users.map((u: any) => u.idusuario);
    if (ids.length > 0) {
      const entrenadoresData = await this.communityRepository.getCoachSpecialties(ids);
      return users.map((u: any) => {
        const e = entrenadoresData.find((ed: any) => ed.idusuario === u.idusuario);
        return { ...u, especialidad: e?.especialidad || 'Especialista en Hábitos' };
      });
    }

    return users;
  }

  // ================= Artículos =================

  async getArticulos() {
    return this.communityRepository.getArticulos();
  }

  // ================= Hábitos Comunitarios =================

  async getCommunityHabits() {
    const data = await this.communityRepository.getCommunityHabits();

    const categoryIds = [...new Set(data.map((h: any) => h.idcategoria))];
    const categoriesMap: any = {};

    if (categoryIds.length > 0) {
      const catData = await this.communityRepository.getHabitCategories(categoryIds);
      catData.forEach((c: any) => categoriesMap[c.idcategoria] = c);
    }

    return data.map((h: any) => {
      const cat = categoriesMap[h.idcategoria] || {};
      return {
        idhabito: h.idpublicacion,
        nombre: h.nombre_habito,
        descripcion: h.descripcion,
        meta_diaria: h.meta_diaria,
        unidad_medida: h.unidad_medida,
        puntos: h.likes || 0,
        idcategoria: h.idcategoria,
        idusuario: h.idusuario,
        clones_count: h.clones_count || 0,
        categoria_nombre: cat.nombre || 'General',
      };
    });
  }

  async cloneHabit(userId: string, idhabito: string) {
    const originalHabit = await this.communityRepository.getPublishedHabit(idhabito);

    await this.communityRepository.updateClonesCount(idhabito, (originalHabit.clones_count || 0) + 1);

    const newHabit = {
      nombre: originalHabit.nombre_habito,
      descripcion: originalHabit.descripcion,
      meta_diaria: originalHabit.meta_diaria,
      unidad_medida: originalHabit.unidad_medida,
      idcategoria: originalHabit.idcategoria,
      puntos: originalHabit.likes || 0,
      idusuario: userId,
      estado: "Activo",
      fechainicio: new Date().toISOString().slice(0, 10),
    };

    return this.communityRepository.createUserHabit(newHabit);
  }

  async shareHabit(userId: string, idhabito: string) {
    const habito = await this.communityRepository.getUserHabit(idhabito, userId);

    const habitData = {
      nombre_habito: habito.nombre,
      descripcion: habito.descripcion,
      meta_diaria: habito.meta_diaria,
      unidad_medida: habito.unidad_medida,
      idcategoria: habito.idcategoria,
      likes: habito.puntos || 0,
      dias_semana: habito.dias_semana || [1, 2, 3, 4, 5, 6, 7],
      idusuario: userId,
      clones_count: 0,
    };

    return this.communityRepository.publishHabit(habitData);
  }

  async deleteSharedHabit(token: string, idhabito: string) {
    const user = await this.communityRepository.validateUserTokenFromClient(token);
    const original = await this.communityRepository.getPublishedHabitOwner(idhabito);

    if (original.idusuario !== user.id) {
      throw new UnauthorizedException('No tienes permiso para eliminar este hábito');
    }

    return this.communityRepository.deletePublishedHabit(idhabito);
  }
}
