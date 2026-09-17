import { SupabaseService } from '../supabase/supabase.service';
export declare class CommunityService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getForums(userId: string): Promise<{
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
    createComment(dto: any): Promise<{
        idComentario: any;
        contenido: any;
        fechaPublicacion: any;
        idComentarioPadre: any;
        idForo: any;
        idUsuario: any;
    }>;
    toggleReaction(dto: any): Promise<boolean>;
    subscribeToForum(userId: string, forumId: string): Promise<boolean>;
    unsubscribeFromForum(userId: string, forumId: string): Promise<boolean>;
    getArticles(limit?: number): Promise<{
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
    getRetos(): Promise<{
        idReto: any;
        titulo: any;
        descripcion: any;
        puntosRecompensa: any;
        tareas: any;
    }[]>;
    joinReto(retoId: string, userId: string): Promise<{
        message: string;
    }>;
}
