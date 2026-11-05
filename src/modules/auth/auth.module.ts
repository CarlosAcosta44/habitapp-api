import { MailModule } from '../../core/mail/mail.module';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { SupabaseModule } from '../../core/supabase/supabase.module';
import { UserRepository } from '../users/repositories/user.repository';

@Module({
  imports: [
    MailModule,
    SupabaseModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret =
          configService.get<string>('JWT_SECRET') ||
          configService.get<string>('JWT_ACCESS_SECRET') ||
          configService.get<string>('SUPABASE_JWT_SECRET') ||
          process.env.JWT_SECRET ||
          process.env.JWT_ACCESS_SECRET ||
          process.env.SUPABASE_JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET no configurado en variables de entorno');
        }
        return {
          secret,
          signOptions: { expiresIn: '7d' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    { provide: 'IUserRepository', useClass: UserRepository },
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
