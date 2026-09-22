import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';

// Controllers
import { UsersController } from './controllers/users.controller';
import { ComunidadController } from './controllers/community.controller';
import { HabitsController } from './controllers/habits.controller';
import { RecordsController } from './controllers/records.controller';
import { FriendsController } from './controllers/friends.controller';

// Services
import { UsersService } from './services/users.service';
import { CommunityService } from './services/community.service';
import { HabitsService } from './services/habits.service';
import { RecordsService } from './services/records.service';
import { FriendsService } from './services/friends.service';

// Repositories
import { UsersRepository } from './repositories/users.repository';
import { CommunityRepository } from './repositories/community.repository';
import { HabitsRepository } from './repositories/habits.repository';
import { RecordsRepository } from './repositories/records.repository';
import { FriendsRepository } from './repositories/friends.repository';

@Module({
  imports: [SupabaseModule],
  controllers: [
    UsersController,
    ComunidadController,
    HabitsController,
    RecordsController,
    FriendsController,
  ],
  providers: [
    UsersService,
    UsersRepository,
    CommunityService,
    CommunityRepository,
    HabitsService,
    HabitsRepository,
    RecordsService,
    RecordsRepository,
    FriendsService,
    FriendsRepository,
  ],
  exports: [UsersService, UsersRepository, CommunityService],
})
export class UsersModule {}
