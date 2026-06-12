import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoachModule } from './coach/coach.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    SupabaseModule,
    AuthModule,
    UsersModule,
    CoachModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
