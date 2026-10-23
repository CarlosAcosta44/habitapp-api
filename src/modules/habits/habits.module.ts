
import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../core/supabase/supabase.module';
import { HabitsController } from './controllers/habits.controller';
import { RecordsController } from './controllers/records.controller';
import { HabitsService } from './services/habits.service';
import { RecordsService } from './services/records.service';
import { HabitsRepository } from './repositories/habits.repository';
import { RecordsRepository } from './repositories/records.repository';

@Module({
  imports: [SupabaseModule],
  controllers: [HabitsController, RecordsController],
  providers: [HabitsService, RecordsService, HabitsRepository, RecordsRepository],
  exports: [HabitsService, RecordsService],
})
export class HabitsModule {}
