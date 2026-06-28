import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60000, // 60 segundos por defecto
    }),
    SupabaseModule, // Necesario para inyectar SupabaseService
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
