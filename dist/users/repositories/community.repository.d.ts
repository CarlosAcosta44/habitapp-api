import { SupabaseService } from '../../supabase/services/supabase.service';
export declare class CommunityRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get client();
    getForums(): Promise<any[]>;
    getUsersByIds(userIds: string[]): Promise<{
        idusuario: any;
        nombre: any;
        apellido: any;
    }[]>;
    getCommentCountsByForumIds(forumIds: string[]): Promise<{
        idforo: any;
    }[]>;
    getForumSubscriptions(forumIds: string[]): Promise<{
        idforo: any;
        idusuario: any;
    }[]>;
    createForum(userId: string, titulo: string, descripcion: string, categoria: string, imagenUrl?: string): Promise<any>;
    getForumOwner(forumId: string): Promise<{
        idusuario: any;
    } | null>;
    updateForum(forumId: string, updates: {
        titulo?: string;
        descripcion?: string;
        categoria?: string;
        imagenUrl?: string;
    }): Promise<any>;
    deleteForum(forumId: string): Promise<{
        success: boolean;
    }>;
    getCommentsByForumId(forumId: string): Promise<any[]>;
    getCommentReactions(commentIds: string[]): Promise<{
        idcomentario: any;
        idusuario: any;
        tipo: any;
    }[]>;
    createComment(userId: string, forumId: string, contenido: string, parentId?: string, imagenUrl?: string): Promise<any>;
    getCommentOwner(commentId: string): Promise<{
        idusuario: any;
    } | null>;
    updateComment(commentId: string, contenido: string, imagenUrl?: string): Promise<any>;
    deleteComment(commentId: string): Promise<{
        success: boolean;
    }>;
    getForumSubscription(forumId: string, userId: string): Promise<any>;
    addForumSubscription(forumId: string, userId: string): Promise<any>;
    removeForumSubscription(forumId: string, userId: string): Promise<void>;
    getReaction(targetType: 'comentario' | 'articulo', targetId: string, userId: string, tipo: string): Promise<{
        idreaccion: any;
    } | null>;
    addReaction(insertData: any): Promise<any>;
    removeReaction(reactionId: string): Promise<void>;
    getRetos(): Promise<any[]>;
    joinReto(userId: string, retoId: string): Promise<any>;
    getCoachRoleId(): Promise<any>;
    getUsersByRole(idrol: string): Promise<{
        idusuario: any;
        nombre: any;
        apellido: any;
        fotoperfil: any;
        genero: any;
    }[]>;
    getCoachSpecialties(userIds: string[]): Promise<{
        idusuario: any;
        especialidad: any;
    }[]>;
    getArticulos(): Promise<any[]>;
    getCommunityHabits(): Promise<{
        idpublicacion: any;
        nombre_habito: any;
        descripcion: any;
        meta_diaria: any;
        unidad_medida: any;
        likes: any;
        clones_count: any;
        idcategoria: any;
        idusuario: any;
    }[]>;
    getHabitCategories(categoryIds: any[]): Promise<{
        idcategoria: any;
        nombre: any;
    }[]>;
    getPublishedHabit(idpublicacion: string): Promise<any>;
    updateClonesCount(idpublicacion: string, newCount: number): Promise<void>;
    createUserHabit(habitData: any): Promise<any>;
    getUserHabit(idhabito: string, userId: string): Promise<any>;
    publishHabit(habitData: any): Promise<any>;
    getPublishedHabitOwner(idpublicacion: string): Promise<{
        idusuario: any;
    }>;
    deletePublishedHabit(idpublicacion: string): Promise<{
        success: boolean;
    }>;
    uploadImageToStorage(filePath: string, buffer: Buffer, mimetype: string): Promise<string>;
    validateUserToken(accessToken: string): Promise<import("@supabase/auth-js").User>;
    validateUserTokenFromClient(accessToken: string): Promise<any>;
}
