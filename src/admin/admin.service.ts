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

    // Validar existencia
    const { data: forum, error: fetchError } = await client
      .schema('comunidad')
      .from('foros')
      .select('idforo')
      .eq('idforo', forumId)
      .single();

    if (fetchError || !forum) {
      throw new NotFoundException(`Forum with ID ${forumId} not found`);
    }

    // Eliminar. Supabase maneja el borrado en cascada
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
