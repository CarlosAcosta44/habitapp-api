import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { CoachController } from './controllers/coach.controller';
import { CoachService } from './services/coach.service';
import { ReportsModule } from '../reports/reports.module';
import { CoachRepository } from './repositories/coach.repository';

@Module({
  imports: [SupabaseModule, ReportsModule],
  controllers: [CoachController],
  providers: [CoachService, CoachRepository],
})
export class CoachModule {}
