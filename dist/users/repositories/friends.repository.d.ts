import { SupabaseService } from '../../supabase/services/supabase.service';
export declare class FriendsRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get client();
    existsRelation(userId: string, targetUserId: string): Promise<boolean>;
    createAcceptedRelation(userId: string, targetUserId: string): Promise<void>;
    getAcceptedFriends(userId: string): Promise<{
        id: any;
        nombre: any;
        apellido: any;
        puntos: any;
        top: boolean;
    }[]>;
    getFriendSuggestions(userId: string, limit?: number): Promise<{
        id: any;
        nombre: any;
        apellido: any;
    }[]>;
    targetUserExists(targetUserId: string): Promise<boolean>;
}
