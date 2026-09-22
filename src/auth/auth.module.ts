import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { SupabaseModule } from '../supabase/supabase.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAuthGuard, RolesGuard],
  exports: [AuthService, AuthRepository, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
