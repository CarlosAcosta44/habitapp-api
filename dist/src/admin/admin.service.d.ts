import { SupabaseService } from '../supabase/supabase.service';
export declare class AdminService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    deleteForum(forumId: string): Promise<{
        message: string;
    }>;
    deleteForumComment(commentId: string): Promise<{
        message: string;
    }>;
}
