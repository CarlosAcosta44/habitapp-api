import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { HabitsRepository } from './repositories/habits.repository';
import { HabitsService } from './services/habits.service';
import { HabitsController } from './habits.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [HabitsController],
  providers: [HabitsService, HabitsRepository],
  exports: [HabitsRepository],
})
export class HabitsModule {}
