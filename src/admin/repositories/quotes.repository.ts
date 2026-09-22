import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/services/supabase.service';

@Injectable()
export class QuotesRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllQuotes() {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('comunidad')
      .from('quotes')
      .select('*');

    if (error) {
      console.error('Error fetching quotes:', error.message);
      return null;
    }
    return data;
  }
}
