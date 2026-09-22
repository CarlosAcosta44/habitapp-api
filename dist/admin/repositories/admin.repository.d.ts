import { SupabaseService } from '../../supabase/services/supabase.service';
export declare class AdminRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getForum(forumId: string): Promise<{
        idforo: any;
    }>;
    getForumComments(forumId: string): Promise<{
        idcomentario: any;
    }[]>;
    deleteForumAdmins(forumId: string): Promise<void>;
    deleteForumSubscriptions(forumId: string): Promise<void>;
    deleteReactionsForComments(commentIds: string[]): Promise<void>;
    deleteComments(commentIds: string[]): Promise<void>;
    deleteForum(forumId: string): Promise<void>;
    getComment(commentId: string): Promise<{
        idcomentario: any;
    }>;
    deleteComment(commentId: string): Promise<void>;
}
