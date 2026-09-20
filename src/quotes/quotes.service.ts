import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class QuotesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getDailyQuote() {
    const supabase = this.supabaseService.getClient();
    // Fetch all quotes
    const { data, error } = await supabase.from('quotes').select('*');
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return { phrase: 'Cada día es una nueva oportunidad.', author: 'HabitApp' };
    }
    // Determinar la frase del día usando la fecha actual (día del año) para que rote
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const index = dayOfYear % data.length;
    return data[index];
  }
}
