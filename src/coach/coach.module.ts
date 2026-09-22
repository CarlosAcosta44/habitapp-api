import { Module } from '@nestjs/common';
import { CoachController } from './controllers/coach.controller';
import { CoachService } from './services/coach.service';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ReportsModule],
  controllers: [CoachController],
  providers: [CoachService],
})
export class CoachModule {}
