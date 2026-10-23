import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../core/supabase/supabase.module';
import { UsersController } from './controllers/users.controller';
import { FriendsController } from './controllers/friends.controller';
import { UsersService } from './services/users.service';
import { FriendsService } from './services/friends.service';
import { UsersRepository } from './repositories/users.repository';
import { FriendsRepository } from './repositories/friends.repository';
import { UserRepository } from './repositories/user.repository';
@Module({
  imports: [SupabaseModule],
  controllers: [
    UsersController,
    FriendsController,
  ],
  providers: [
    UsersService,
    UsersRepository,
    FriendsService,
    FriendsRepository,
    UserRepository
  ],
  exports: [UsersService, UsersRepository, UserRepository],
})
export class UsersModule {}
