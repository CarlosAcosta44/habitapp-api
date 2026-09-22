import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/services/supabase.service';

@Injectable()
export class AdminRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getForum(forumId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('comunidad')
      .from('foros')
      .select('idforo')
      .eq('idforo', forumId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Forum with ID ${forumId} not found`);
    }
    return data;
  }

  async getForumComments(forumId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('comunidad')
      .from('comentarios')
      .select('idcomentario')
      .eq('idforo', forumId);

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch forum comments: ${error.message}`);
    }
    return data;
  }

  async deleteForumAdmins(forumId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('comunidad')
      .from('foro_administrador')
      .delete()
      .eq('idforo', forumId);

    if (error) {
      throw new InternalServerErrorException(`Failed to delete forum admins: ${error.message}`);
    }
  }

  async deleteForumSubscriptions(forumId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('comunidad')
      .from('usuario_foro')
      .delete()
      .eq('idforo', forumId);

    if (error) {
      throw new InternalServerErrorException(`Failed to delete forum subscriptions: ${error.message}`);
    }
  }

  async deleteReactionsForComments(commentIds: string[]) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('comunidad')
      .from('reacciones')
      .delete()
      .in('idcomentario', commentIds);

    if (error) {
      throw new InternalServerErrorException(`Failed to delete reactions for comments: ${error.message}`);
    }
  }

  async deleteComments(commentIds: string[]) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('comunidad')
      .from('comentarios')
      .delete()
      .in('idcomentario', commentIds);

    if (error) {
      throw new InternalServerErrorException(`Failed to delete comments: ${error.message}`);
    }
  }

  async deleteForum(forumId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('comunidad')
      .from('foros')
      .delete()
      .eq('idforo', forumId);

    if (error) {
      throw new InternalServerErrorException(`Failed to delete forum: ${error.message}`);
    }
  }

  async getComment(commentId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('comunidad')
      .from('comentarios')
      .select('idcomentario')
      .eq('idcomentario', commentId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
    return data;
  }

  async deleteComment(commentId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('comunidad')
      .from('comentarios')
      .delete()
      .eq('idcomentario', commentId);

    if (error) {
      throw new InternalServerErrorException(`Failed to delete comment: ${error.message}`);
    }
  }
}
