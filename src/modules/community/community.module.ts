
import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../core/supabase/supabase.module';
import { ComunidadController } from './controllers/community.controller';
import { CommunityService } from './services/community.service';
import { CommunityRepository } from './repositories/community.repository';

@Module({
  imports: [SupabaseModule],
  controllers: [ComunidadController],
  providers: [CommunityService, CommunityRepository],
  exports: [CommunityService],
})
export class CommunityModule {}
