import { SupabaseService } from '../../supabase/services/supabase.service';
export declare class QuotesRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getAllQuotes(): Promise<any[] | null>;
}
