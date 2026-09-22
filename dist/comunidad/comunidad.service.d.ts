import { SupabaseService } from '../supabase/supabase.service';
export declare class ComunidadService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private getClient;
    private decodeJwtUserId;
    getForums(accessToken?: string): Promise<any>;
    getCommentsByForumId(forumId: string, accessToken?: string): Promise<any>;
    uploadImage(accessToken: string, file: Express.Multer.File): Promise<{
        url: string;
    }>;
    createForum(userId: string, titulo: string, descripcion: string, categoria: string, imagenUrl?: string): Promise<any>;
    updateForum(userId: string, forumId: string, updates: {
        titulo?: string;
        descripcion?: string;
        categoria?: string;
        imagenUrl?: string;
    }): Promise<any>;
    deleteForum(userId: string, forumId: string): Promise<{
        success: boolean;
    }>;
    addComment(userId: string, forumId: string, contenido: string, parentId?: string, imagenUrl?: string): Promise<any>;
    updateComment(userId: string, commentId: string, contenido: string, imagenUrl?: string): Promise<any>;
    deleteComment(userId: string, commentId: string): Promise<{
        success: boolean;
    }>;
    addReaction(userId: string, targetType: 'comentario' | 'articulo' | 'foro', targetId: string, tipo: string): Promise<{
        toggled: string;
        data?: undefined;
    } | {
        toggled: string;
        data: any;
    }>;
    getRetos(): Promise<any>;
    joinReto(accessToken: string, retoId: string): Promise<any>;
    getEspecialistas(): Promise<any>;
    getArticulos(): Promise<any>;
    getCommunityHabits(): Promise<any>;
    cloneHabit(token: string, idhabito: string): Promise<any>;
    shareHabit(token: string, idhabito: string): Promise<any>;
    deleteSharedHabit(token: string, idhabito: string): Promise<{
        success: boolean;
    }>;
}
