import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { FriendsRepository } from './repositories/friends.repository';
import { FriendsService } from './services/friends.service';
import { FriendsController } from './friends.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [FriendsController],
  providers: [FriendsService, FriendsRepository],
})
export class FriendsModule {}
