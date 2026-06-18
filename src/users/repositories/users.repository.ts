import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { UserProfileDto } from '../dto/user-profile.dto';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findById(id: string): Promise<UserProfileDto> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .schema('gestion')
      .from('usuarios')
      .select('*')
      .eq('idusuario', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.logger.error(`Error fetching user profile: ${error.message}`);
      throw new InternalServerErrorException('Error retrieving user data from database');
    }

    return data as UserProfileDto;
  }
}
