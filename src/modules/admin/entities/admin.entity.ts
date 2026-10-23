/**
 * Admin Entities
 * Representan las estructuras de dominio del módulo Admin.
 * Son tipos de solo lectura usados por servicios y repositorios
 * para tipar explícitamente las respuestas de la base de datos.
 */

export interface ForumEntity {
  idforo: string;
  titulo: string;
  descripcion?: string;
  categoria?: string;
  imagen_url?: string;
  idusuario: string;
  estado: 'Abierto' | 'Cerrado';
  fechacreacion?: string;
}

export interface CommentEntity {
  idcomentario: string;
  contenido: string;
  idforo: string;
  idusuario: string;
  idcomentario_padre?: string;
  imagen_url?: string;
  fechapublicacion?: string;
}

export interface DeleteForumResult {
  message: string;
}

export interface DeleteCommentResult {
  message: string;
}
