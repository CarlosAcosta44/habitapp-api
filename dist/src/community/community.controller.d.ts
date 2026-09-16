import { CommunityService } from './community.service';
import { CreateCommentDto, ToggleReactionDto } from './dto/community.dto';
interface AuthenticatedUser {
    userId: string;
    email: string;
    role: string;
}
export declare class CommunityController {
    private readonly communityService;
    constructor(communityService: CommunityService);
    getForums(user: any): Promise<{
        idForo: any;
        titulo: any;
        descripcion: any;
        categoria: any;
        estado: any;
        fechaCreacion: any;
        totalComentarios: any;
        totalSuscriptores: any;
        estasSuscrito: any;
    }[]>;
    getComments(forumId: string): Promise<any[]>;
    createComment(dto: CreateCommentDto, user: any): Promise<{
        idComentario: any;
        contenido: any;
        fechaPublicacion: any;
        idComentarioPadre: any;
        idForo: any;
        idUsuario: any;
    }>;
    toggleReaction(dto: ToggleReactionDto, user: any): Promise<boolean>;
    subscribeToForum(forumId: string, user: any): Promise<boolean>;
    unsubscribeFromForum(forumId: string, user: any): Promise<boolean>;
    getArticles(): Promise<{
        idArticulo: any;
        titulo: any;
        contenido: any;
        categoria: any;
        estado: any;
        fechaPublicacion: any;
    }[]>;
    getTrainers(lat?: number, lng?: number): Promise<{
        idEntrenador: any;
        nombre: any;
        apellido: any;
        fotoPerfil: any;
        especialidad: any;
        certificacion: any;
        distanciaKm: number | null;
    }[]>;
    createForum(req: any, dto: any): {
        message: string;
    };
    updateComment(commentId: string, req: any, dto: any): {
        message: string;
    };
    deleteComment(commentId: string, req: any): {
        message: string;
    };
    getRetos(): Promise<{
        idReto: any;
        titulo: any;
        descripcion: any;
        puntosRecompensa: any;
        tareas: any;
    }[]>;
    joinReto(retoId: string, user: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
export {};
