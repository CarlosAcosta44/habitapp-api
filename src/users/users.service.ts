import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('User profile not found');
    }

    return data;
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('user_profiles')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('User profile not found or could not be updated');
    }

    return data;
  }
}
