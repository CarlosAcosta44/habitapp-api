export declare class CreateCommentDto {
    contenido: string;
    idForo: string;
    idComentarioPadre?: string;
}
export declare class ToggleReactionDto {
    tipo: string;
    idComentario?: string;
    idArticulo?: string;
}
