import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { QuotesController } from './controllers/quotes.controller';
import { AdminService } from './services/admin.service';
import { AdminRepository } from './repositories/admin.repository';
import { QuotesService } from './services/quotes.service';
import { QuotesRepository } from './repositories/quotes.repository';
import { UsersModule } from '../users/users.module';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
  imports: [SupabaseModule, UsersModule],
  controllers: [AdminController, QuotesController],
  providers: [AdminService, AdminRepository, QuotesService, QuotesRepository],
})
export class AdminModule {}
