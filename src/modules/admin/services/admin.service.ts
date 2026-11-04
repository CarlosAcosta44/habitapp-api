import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async deleteForum(forumId: string) {
    // Validar existencia del foro
    await this.adminRepository.getForum(forumId);

    // Buscar todos los comentarios del foro
    const comments = await this.adminRepository.getForumComments(forumId);

    // Eliminar admins del foro
    await this.adminRepository.deleteForumAdmins(forumId);

    // Eliminar suscripciones al foro
    await this.adminRepository.deleteForumSubscriptions(forumId);

    // Borrado manual en cascada de comentarios
    if (comments && comments.length > 0) {
      const commentIds = comments.map((c: any) => c.idcomentario);

      // Eliminar reacciones de todos los comentarios de este foro
      await this.adminRepository.deleteReactionsForComments(commentIds);

      // Eliminar todos los comentarios
      await this.adminRepository.deleteComments(commentIds);
    }

    // Eliminar el foro
    await this.adminRepository.deleteForum(forumId);

    return { message: 'Forum and its comments deleted successfully' };
  }

  async deleteForumComment(commentId: string) {
    // Validar existencia
    await this.adminRepository.getComment(commentId);

    // Eliminar comentario
    await this.adminRepository.deleteComment(commentId);

    return { message: 'Comment deleted successfully' };
  }
}
