import { Module } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { NotificationsRepository } from './repositories/notifications.repository';
import { EmailService } from './services/email.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository, EmailService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
