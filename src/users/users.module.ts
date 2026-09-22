import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsersController } from './controllers/users.controller';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './services/users.service';
import { CommunityService } from './services/community.service';
import { CommunityRepository } from './repositories/community.repository';

@Module({
  imports: [SupabaseModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, CommunityService, CommunityRepository],
  exports: [UsersService, UsersRepository, CommunityService],
})
export class UsersModule {}
