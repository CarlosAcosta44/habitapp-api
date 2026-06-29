import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AdminService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async deleteForum(forumId: string) {
    const client = this.supabaseService.getClient();

    // Validar existencia del foro
    const { data: forum, error: fetchError } = await client
      .schema('comunidad')
      .from('foros')
      .select('idforo')
      .eq('idforo', forumId)
      .single();

    if (fetchError || !forum) {
      throw new NotFoundException(`Forum with ID ${forumId} not found`);
    }

    // Buscar todos los comentarios del foro
    const { data: comments, error: fetchCommentsError } = await client
      .schema('comunidad')
      .from('comentarios')
      .select('idcomentario')
      .eq('idforo', forumId);

    if (fetchCommentsError) {
      throw new InternalServerErrorException(
        `Failed to fetch forum comments: ${fetchCommentsError.message}`,
      );
    }

    // Eliminar admins del foro
    const { error: deleteAdminsError } = await client
      .schema('comunidad')
      .from('foro_administrador')
      .delete()
      .eq('idforo', forumId);

    if (deleteAdminsError) {
      throw new InternalServerErrorException(
        `Failed to delete forum admins: ${deleteAdminsError.message}`,
      );
    }

    // Eliminar suscripciones al foro
    const { error: deleteSubsError } = await client
      .schema('comunidad')
      .from('usuario_foro')
      .delete()
      .eq('idforo', forumId);

    if (deleteSubsError) {
      throw new InternalServerErrorException(
        `Failed to delete forum subscriptions: ${deleteSubsError.message}`,
      );
    }

    // Borrado manual en cascada de comentarios
    if (comments && comments.length > 0) {
      const commentIds = comments.map((c: any) => c.idcomentario);

      // Eliminar reacciones de todos los comentarios de este foro
      const { error: deleteReactionsError } = await client
        .schema('comunidad')
        .from('reacciones')
        .delete()
        .in('idcomentario', commentIds);

      if (deleteReactionsError) {
        throw new InternalServerErrorException(
          `Failed to delete reactions for comments: ${deleteReactionsError.message}`,
        );
      }

      // Eliminar todos los comentarios
      const { error: deleteCommentsError } = await client
        .schema('comunidad')
        .from('comentarios')
        .delete()
        .in('idcomentario', commentIds);

      if (deleteCommentsError) {
        throw new InternalServerErrorException(
          `Failed to delete comments: ${deleteCommentsError.message}`,
        );
      }
    }

    // Eliminar el foro
    const { error: deleteError } = await client
      .schema('comunidad')
      .from('foros')
      .delete()
      .eq('idforo', forumId);

    if (deleteError) {
      throw new InternalServerErrorException(
        `Failed to delete forum: ${deleteError.message}`,
      );
    }

    return { message: 'Forum and its comments deleted successfully' };
  }

  async deleteForumComment(commentId: string) {
    const client = this.supabaseService.getClient();

    // Validar existencia
    const { data: comment, error: fetchError } = await client
      .schema('comunidad')
      .from('comentarios')
      .select('idcomentario')
      .eq('idcomentario', commentId)
      .single();

    if (fetchError || !comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Eliminar comentario
    const { error: deleteError } = await client
      .schema('comunidad')
      .from('comentarios')
      .delete()
      .eq('idcomentario', commentId);

    if (deleteError) {
      throw new InternalServerErrorException(
        `Failed to delete comment: ${deleteError.message}`,
      );
    }

    return { message: 'Comment deleted successfully' };
  }
}
