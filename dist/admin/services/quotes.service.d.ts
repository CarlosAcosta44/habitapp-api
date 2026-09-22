import { SupabaseService } from '../../supabase/supabase.service';
export declare class QuotesService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getDailyQuote(): Promise<any>;
}
