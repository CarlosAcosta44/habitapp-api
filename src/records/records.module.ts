import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { HabitsModule } from '../habits/habits.module';
import { RecordsRepository } from './repositories/records.repository';
import { RecordsService } from './services/records.service';
import { RecordsController } from './records.controller';

@Module({
  imports: [SupabaseModule, HabitsModule],
  controllers: [RecordsController],
  providers: [RecordsService, RecordsRepository],
})
export class RecordsModule {}
