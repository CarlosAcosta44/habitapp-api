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
