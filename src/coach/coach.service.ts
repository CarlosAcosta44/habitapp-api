import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CoachService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getClients(trainerId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('user_trainers')
      .select('assigned_at, user_profiles(*)')
      .eq('trainer_id', trainerId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch clients: ${error.message}`,
      );
    }

    // Map the Supabase response to the ClientDto structure
    return data.map((item: any) => ({
      assigned_at: item.assigned_at,
      client: item.user_profiles,
    }));
  }
}
