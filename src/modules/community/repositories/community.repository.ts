import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../core/supabase/services/supabase.service';

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

  async getForumById(forumId: string) {
    const { data, error } = await this.client
      .schema('comunidad')
      .from('foros')
      .select('*')
      .eq('idforo', forumId)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

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
    const safeTitulo = titulo ? titulo.trim().substring(0, 45) : 'Foro de la Comunidad';
    const safeCategoria = categoria ? categoria.trim().replace(/^#+/, '').substring(0, 45) : 'General';
    const { data, error } = await this.client
      .schema('comunidad')
      .from('foros')
      .insert({
        titulo: safeTitulo,
        descripcion: descripcion || '',
        categoria: safeCategoria,
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
    // 1. Delete forum subscriptions
    const { data: deletedSubs, error: subError } = await this.client.schema('comunidad').from('usuario_foro').delete().eq('idforo', forumId).select();
    if (subError) throw new BadRequestException(`Failed to delete subscriptions: ${subError.message}`);
    if (!deletedSubs || deletedSubs.length === 0) {
      // Just check if there were actually any subscriptions. If not, it's fine.
      // But if we fail later, it means there WERE subscriptions that we didn't delete!
    }

    // 2. Find all comments for this forum
    const { data: comments, error: comError } = await this.client
      .schema('comunidad')
      .from('comentarios')
      .select('idcomentario')
      .eq('idforo', forumId);
    if (comError) throw new BadRequestException(`Failed to fetch comments: ${comError.message}`);

    if (comments && comments.length > 0) {
      const commentIds = comments.map(c => c.idcomentario);
      // 3. Delete all reactions for these comments
      const { error: reactError } = await this.client.schema('comunidad').from('reacciones').delete().in('idcomentario', commentIds);
      if (reactError) throw new BadRequestException(`Failed to delete reactions: ${reactError.message}`);
    }

    // 4. Delete all comments
    const { error: delComError } = await this.client.schema('comunidad').from('comentarios').delete().eq('idforo', forumId);
    if (delComError) throw new BadRequestException(`Failed to delete comments: ${delComError.message}`);

    // 5. Finally, delete the forum
    const { error } = await this.client
      .schema('comunidad')
      .from('foros')
      .delete()
      .eq('idforo', forumId);

    if (error) throw new BadRequestException(`Failed to delete forum: ${error.message}`);
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
    // 1. Find child comments (replies)
    const { data: childComments } = await this.client
      .schema('comunidad')
      .from('comentarios')
      .select('idcomentario')
      .eq('idcomentario_padre', commentId);

    const idsToDelete = [commentId];
    if (childComments && childComments.length > 0) {
      idsToDelete.push(...childComments.map(c => c.idcomentario));
    }

    // 2. Delete reactions for the comment and its children
    await this.client
      .schema('comunidad')
      .from('reacciones')
      .delete()
      .in('idcomentario', idsToDelete);

    // 3. Delete child comments
    if (childComments && childComments.length > 0) {
      await this.client
        .schema('comunidad')
        .from('comentarios')
        .delete()
        .eq('idcomentario_padre', commentId);
    }

    // 4. Finally, delete the main comment
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

  async getRetos(userId?: string) {
    const { data: retos, error } = await this.client
      .schema('comunidad')
      .from('retos')
      .select('*')
      .order('fechainicio', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    if (!retos || retos.length === 0) return [];

    const { data: participants } = await this.client
      .schema('comunidad')
      .from('usuario_reto')
      .select('idreto, idusuario, estado, fechainscripcion');

    const countsMap: Record<string, number> = {};
    const usersMap: Record<string, string[]> = {};
    const userParticipationMap: Record<string, any> = {};

    if (participants) {
      for (const p of participants) {
        countsMap[p.idreto] = (countsMap[p.idreto] || 0) + 1;
        if (!usersMap[p.idreto]) usersMap[p.idreto] = [];
        usersMap[p.idreto].push(p.idusuario);

        if (userId && p.idusuario === userId) {
          userParticipationMap[p.idreto] = p;
        }
      }
    }

    // Tareas de los retos
    const { data: tareas } = await this.client
      .schema('comunidad')
      .from('reto_tareas')
      .select('*');

    const tareasMap: Record<string, any[]> = {};
    if (tareas) {
      for (const t of tareas) {
        if (!tareasMap[t.idreto]) tareasMap[t.idreto] = [];
        tareasMap[t.idreto].push(t);
      }
    }

    // Progreso del usuario
    const progressMap: Record<string, any> = {};
    if (userId) {
      const { data: progressList } = await this.client
        .schema('comunidad')
        .from('usuario_tarea_progreso')
        .select('*')
        .eq('idusuario', userId);

      if (progressList) {
        for (const prog of progressList) {
          progressMap[prog.idtarea] = prog;
        }
      }
    }

    return retos.map((r: any) => {
      const userPart = userParticipationMap[r.idreto] || null;
      const isEnrolled = Boolean(userPart);
      const isCompleted = userPart?.estado === 'Completado';
      const rTareas = tareasMap[r.idreto] || [];
      const mainTarea = rTareas[0];
      const targetVal = mainTarea?.metrica_objetivo || 7;
      const userProgItem = mainTarea ? progressMap[mainTarea.idtarea] : null;
      const curVal = isCompleted ? targetVal : (userProgItem?.valor_actual || 0);
      const pct = Math.min(100, Math.round((curVal / targetVal) * 100));

      const today = new Date().toISOString().slice(0, 10);
      const lastUpdateDate = userProgItem?.ultima_actualizacion
        ? new Date(userProgItem.ultima_actualizacion).toISOString().slice(0, 10)
        : null;
      const checkedInToday = isCompleted || (lastUpdateDate === today && (userProgItem?.valor_actual || 0) > 0);

      return {
        ...r,
        icono: r.icono || '🏆',
        participantes_count: countsMap[r.idreto] || 0,
        usuarios_participando: usersMap[r.idreto] || [],
        inscrito: isEnrolled,
        completado: isCompleted,
        usuario_estado: userPart?.estado || null,
        progreso: isCompleted ? 100 : pct,
        dias_progreso: curVal,
        dias_objetivo: targetVal,
        checkin_hecho_hoy: checkedInToday,
      };
    });
  }

  async joinReto(userId: string, retoId: string) {
    const { data: reto, error: retoError } = await this.client
      .schema('comunidad')
      .from('retos')
      .select('idreto, estado, fechafin')
      .eq('idreto', retoId)
      .maybeSingle();

    if (retoError || !reto) {
      throw new NotFoundException('Reto no encontrado');
    }

    const today = new Date().toISOString().slice(0, 10);
    if (reto.estado === 'Finalizado' || (reto.fechafin && reto.fechafin < today)) {
      throw new BadRequestException('Este reto ya ha finalizado o caducado y no admite nuevas inscripciones.');
    }

    const { data: existing } = await this.client
      .schema('comunidad')
      .from('usuario_reto')
      .select('*')
      .eq('idusuario', userId)
      .eq('idreto', retoId)
      .maybeSingle();

    if (existing) {
      return { alreadyJoined: true, data: existing };
    }

    const { data, error } = await this.client
      .schema('comunidad')
      .from('usuario_reto')
      .insert({
        idusuario: userId,
        idreto: retoId,
        fechainscripcion: today,
        estado: 'En Curso',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return { alreadyJoined: true };
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async leaveReto(userId: string, retoId: string) {
    const { error } = await this.client
      .schema('comunidad')
      .from('usuario_reto')
      .delete()
      .eq('idusuario', userId)
      .eq('idreto', retoId);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  async createReto(userId: string, dto: {
    titulo: string;
    descripcion: string;
    puntosRecompensa?: number;
    fechaInicio?: string;
    fechaFin?: string;
    icono?: string;
    diasObjetivo?: number;
  }) {
    const today = new Date().toISOString().slice(0, 10);
    const iconoVisual = dto.icono?.trim() || '🏆';

    // Usamos exclusivamente la columna 'icono' de comunidad.retos
    const payload: any = {
      titulo: dto.titulo.trim(),
      descripcion: dto.descripcion.trim(),
      puntos_recompensa: 50, // Siempre 50 puntos estándar por defecto
      icono: iconoVisual,
      fechainicio: dto.fechaInicio || today,
      fechafin: dto.fechaFin || null,
      estado: 'Activo',
      idusuario_creador: userId,
    };

    const { data, error } = await this.client
      .schema('comunidad')
      .from('retos')
      .insert(payload)
      .select()
      .single();

    if (error) throw new BadRequestException(`Error al crear reto: ${error.message}`);

    if (data?.idreto) {
      // Crear la tarea inicial con los días objetivo que el usuario definió como meta
      const diasMeta = dto.diasObjetivo && dto.diasObjetivo > 0 ? dto.diasObjetivo : 7;
      await this.client
        .schema('comunidad')
        .from('reto_tareas')
        .insert({
          idreto: data.idreto,
          nombre: `Check-in diario (${diasMeta} días)`,
          metrica_objetivo: diasMeta,
          unidad_medida: 'días',
          icono: iconoVisual.slice(0, 20),
        });

      await this.joinReto(userId, data.idreto);
    }

    return data;
  }

  async checkinReto(userId: string, retoId: string) {
    const { data: usuarioReto } = await this.client
      .schema('comunidad')
      .from('usuario_reto')
      .select('*')
      .eq('idusuario', userId)
      .eq('idreto', retoId)
      .maybeSingle();

    if (!usuarioReto) {
      throw new BadRequestException('No estás inscrito en este reto.');
    }

    if (usuarioReto.estado === 'Completado') {
      return {
        completed: true,
        alreadyCompleted: true,
        message: '¡Ya has completado este reto anteriormente! 🏆',
        progreso: 100,
        estado: 'Completado',
      };
    }

    const { data: reto } = await this.client
      .schema('comunidad')
      .from('retos')
      .select('*')
      .eq('idreto', retoId)
      .single();

    if (!reto) throw new NotFoundException('Reto no encontrado');

    const today = new Date().toISOString().slice(0, 10);
    if (reto.estado === 'Finalizado' || (reto.fechafin && reto.fechafin < today)) {
      throw new BadRequestException('El reto ya ha finalizado y no es posible registrar más avances.');
    }

    let { data: tareas } = await this.client
      .schema('comunidad')
      .from('reto_tareas')
      .select('*')
      .eq('idreto', retoId);

    if (!tareas || tareas.length === 0) {
      let diasObjetivo = 7;
      if (reto.fechainicio && reto.fechafin) {
        const diff = Math.ceil((new Date(reto.fechafin).getTime() - new Date(reto.fechainicio).getTime()) / (1000 * 3600 * 24));
        if (diff > 0 && diff <= 90) diasObjetivo = diff;
      }
      const { data: nuevaTarea } = await this.client
        .schema('comunidad')
        .from('reto_tareas')
        .insert({
          idreto: retoId,
          nombre: `Check-in diario: ${reto.titulo.slice(0, 50)}`,
          metrica_objetivo: diasObjetivo,
          unidad_medida: 'días',
          icono: '🎯',
        })
        .select()
        .single();

      tareas = nuevaTarea ? [nuevaTarea] : [];
    }

    const mainTarea = tareas[0];

    const { data: userProg } = await this.client
      .schema('comunidad')
      .from('usuario_tarea_progreso')
      .select('*')
      .eq('idusuario', userId)
      .eq('idtarea', mainTarea.idtarea)
      .maybeSingle();

    // Bloqueo de múltiples check-ins el mismo día: 1 check-in por día
    if (userProg && userProg.valor_actual > 0 && userProg.ultima_actualizacion) {
      const lastDate = new Date(userProg.ultima_actualizacion).toISOString().slice(0, 10);
      if (lastDate === today) {
        throw new BadRequestException('Ya has registrado tu check-in de hoy para este reto. ¡Vuelve mañana para continuar! 🌟');
      }
    }

    const nuevoValor = (userProg?.valor_actual ?? 0) + 1;
    const isCompletado = nuevoValor >= mainTarea.metrica_objetivo;

    if (userProg) {
      await this.client
        .schema('comunidad')
        .from('usuario_tarea_progreso')
        .update({
          valor_actual: nuevoValor,
          completado: isCompletado,
          ultima_actualizacion: new Date().toISOString(),
        })
        .eq('idusuario', userId)
        .eq('idtarea', mainTarea.idtarea);
    } else {
      await this.client
        .schema('comunidad')
        .from('usuario_tarea_progreso')
        .insert({
          idusuario: userId,
          idtarea: mainTarea.idtarea,
          valor_actual: nuevoValor,
          completado: isCompletado,
          ultima_actualizacion: new Date().toISOString(),
        });
    }

    if (isCompletado) {
      await this.client
        .schema('comunidad')
        .from('usuario_reto')
        .update({ estado: 'Completado' })
        .eq('idusuario', userId)
        .eq('idreto', retoId);

      const puntos = reto.puntos_recompensa || 50;
      const { data: usuario } = await this.client
        .schema('gestion')
        .from('usuarios')
        .select('puntostotales')
        .eq('idusuario', userId)
        .single();

      if (usuario) {
        await this.client
          .schema('gestion')
          .from('usuarios')
          .update({ puntostotales: (usuario.puntostotales || 0) + puntos })
          .eq('idusuario', userId);

        await this.client
          .schema('gestion')
          .from('historial_puntos')
          .insert({
            puntos: puntos,
            motivo: `Reto completado: ${reto.titulo}`,
            idusuario: userId,
          });
      }

      await this.client
        .schema('gestion')
        .from('notificaciones')
        .insert({
          mensaje: `¡Felicidades! Has completado el reto "${reto.titulo}" y ganaste +${puntos} puntos 🏆`,
          tipo: 'Comunidad',
          idusuario: userId,
        });

      const { count: retosCompletados } = await this.client
        .schema('comunidad')
        .from('usuario_reto')
        .select('*', { count: 'exact', head: true })
        .eq('idusuario', userId)
        .eq('estado', 'Completado');

      await this.checkAndAwardRetosAchievements(userId, retosCompletados || 1);

      return {
        completed: true,
        puntosGanados: puntos,
        dias_progreso: nuevoValor,
        dias_objetivo: mainTarea.metrica_objetivo,
        progreso: 100,
        message: `¡Reto completado! Has ganado +${puntos} puntos 🏆`,
      };
    }

    const pct = Math.min(100, Math.round((nuevoValor / mainTarea.metrica_objetivo) * 100));
    return {
      completed: false,
      dias_progreso: nuevoValor,
      dias_objetivo: mainTarea.metrica_objetivo,
      progreso: pct,
      message: `Avance registrado: ${nuevoValor}/${mainTarea.metrica_objetivo} días (${pct}%) 🎯`,
    };
  }

  async checkAndAwardRetosAchievements(userId: string, count: number) {
    try {
      const targets = [
        { count: 1, name: 'Iniciado en Desafíos' },
        { count: 5, name: 'Espíritu de Superación (5 retos)' },
        { count: 15, name: 'Campeón de la Comunidad (15 retos)' },
        { count: 50, name: 'Titán de Retos (50 retos)' },
      ];

      for (const t of targets) {
        if (count >= t.count) {
          const { data: logro } = await this.client
            .schema('gestion')
            .from('logros')
            .select('idlogro, puntos_recompensa, nombre')
            .eq('nombre', t.name)
            .maybeSingle();

          if (logro) {
            const { data: alreadyHas } = await this.client
              .schema('gestion')
              .from('usuario_logro')
              .select('*')
              .eq('idusuario', userId)
              .eq('idlogro', logro.idlogro)
              .maybeSingle();

            if (!alreadyHas) {
              await this.client
                .schema('gestion')
                .from('usuario_logro')
                .insert({
                  idusuario: userId,
                  idlogro: logro.idlogro,
                  fechaobtenido: new Date().toISOString().slice(0, 10),
                });

              if (logro.puntos_recompensa > 0) {
                const { data: u } = await this.client
                  .schema('gestion')
                  .from('usuarios')
                  .select('puntostotales')
                  .eq('idusuario', userId)
                  .single();

                if (u) {
                  await this.client
                    .schema('gestion')
                    .from('usuarios')
                    .update({ puntostotales: (u.puntostotales || 0) + logro.puntos_recompensa })
                    .eq('idusuario', userId);

                  await this.client
                    .schema('gestion')
                    .from('historial_puntos')
                    .insert({
                      puntos: logro.puntos_recompensa,
                      motivo: `Logro desbloqueado: ${logro.nombre}`,
                      idusuario: userId,
                    });
                }
              }

              await this.client
                .schema('gestion')
                .from('notificaciones')
                .insert({
                  mensaje: `🎖️ ¡Logro desbloqueado: "${logro.nombre}"! +${logro.puntos_recompensa} pts`,
                  tipo: 'Sistema',
                  idusuario: userId,
                });
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Error checking retos achievements:', err.message);
    }
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
      .select('identrenador, idusuario, especialidad, experiencia, certificacion')
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

  async getUserPublishedHabitByName(userId: string, habitName: string) {
    const { data } = await this.client
      .schema('comunidad')
      .from('habitos_publicados')
      .select('idpublicacion, nombre_habito')
      .eq('idusuario', userId)
      .ilike('nombre_habito', habitName.trim())
      .limit(1);

    return data && data.length > 0 ? data[0] : null;
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

  async getActiveUsersCount(): Promise<number> {
    const { count, error } = await this.client
      .schema('gestion')
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'Activo');

    if (error) return 0;
    return count ?? 0;
  }
}
