import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ReportsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getRanking() {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .schema('gestion')
        .from('vista_ranking')
        .select('*')
        .limit(100);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Error al obtener el ranking de usuarios: ' + error.message,
      );
    }
  }
}
