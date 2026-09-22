import { CommunityService } from '../services/community.service';
export declare class ComunidadController {
    private readonly comunidadService;
    constructor(comunidadService: CommunityService);
    getForums(req: any): Promise<any>;
    getComments(req: any, id: string): Promise<any>;
    createForum(req: any, titulo: string, descripcion: string, categoria: string, imagenUrl?: string): Promise<any>;
    uploadImage(req: any, file: Express.Multer.File): Promise<{
        url: string;
    }>;
    updateForum(req: any, id: string, titulo?: string, descripcion?: string, categoria?: string, imagenUrl?: string): Promise<any>;
    deleteForum(req: any, id: string): Promise<{
        success: boolean;
    }>;
    addComment(req: any, forumId: string, contenido: string, parentId?: string, imagenUrl?: string): Promise<any>;
    updateComment(req: any, id: string, contenido: string, imagenUrl?: string): Promise<any>;
    deleteComment(req: any, id: string): Promise<{
        success: boolean;
    }>;
    addReaction(req: any, targetType: 'comentario' | 'articulo' | 'foro', targetId: string, tipo: string): Promise<{
        toggled: string;
        data?: undefined;
    } | {
        toggled: string;
        data: any;
    }>;
    getRetos(): Promise<any>;
    joinReto(req: any, retoId: string): Promise<any>;
    getEspecialistas(): Promise<any>;
    getArticulos(): Promise<any>;
    getCommunityHabits(): Promise<any>;
    cloneHabit(req: any, idhabito: string): Promise<any>;
    shareHabit(req: any, idhabito: string): Promise<any>;
    deleteSharedHabit(req: any, idhabito: string): Promise<{
        success: boolean;
    }>;
}
