import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AdminService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async deleteForumThread(threadId: string) {
    const client = this.supabaseService.getClient();

    // Validar existencia
    const { data: thread, error: fetchError } = await client
      .from('forum_threads')
      .select('id')
      .eq('id', threadId)
      .single();

    if (fetchError || !thread) {
      throw new NotFoundException(`Thread with ID ${threadId} not found`);
    }

    // Eliminar. Supabase (PostgreSQL) maneja el borrado en cascada de los comentarios 
    // gracias a "ON DELETE CASCADE" en forum_comments.thread_id.
    const { error: deleteError } = await client
      .from('forum_threads')
      .delete()
      .eq('id', threadId);

    if (deleteError) {
      throw new InternalServerErrorException(
        `Failed to delete thread: ${deleteError.message}`,
      );
    }

    return { message: 'Thread and its comments deleted successfully' };
  }

  async deleteForumComment(commentId: string) {
    const client = this.supabaseService.getClient();

    // Validar existencia
    const { data: comment, error: fetchError } = await client
      .from('forum_comments')
      .select('id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Eliminar comentario
    const { error: deleteError } = await client
      .from('forum_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      throw new InternalServerErrorException(
        `Failed to delete comment: ${deleteError.message}`,
      );
    }

    return { message: 'Comment deleted successfully' };
  }
}
