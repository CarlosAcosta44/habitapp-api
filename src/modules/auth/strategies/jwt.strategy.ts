import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { resolveJwtSecret } from '../jwt-secret.helper';
import { SupabaseService } from '../../../core/supabase/services/supabase.service';
import { UserRole } from '../../users/dto/user-profile.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    const jwtSecret = resolveJwtSecret(configService);

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          let token = null;
          if (request?.cookies) {
            token = request.cookies['access_token'];
          }
          if (!token && request?.headers?.authorization) {
            token = request.headers.authorization.replace('Bearer ', '');
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    if (!payload?.sub) throw new UnauthorizedException('Token inválido');

    let role = payload.role as UserRole | undefined;

    if (!role) {
      const payloadNombrerol = (payload.nombrerol || '').toString().toLowerCase();
      if (payloadNombrerol.includes('admin')) {
        role = UserRole.ADMIN;
      } else if (payloadNombrerol.includes('entrenador') || payloadNombrerol.includes('trainer')) {
        role = UserRole.TRAINER;
      } else {
        try {
          const { data } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .select('roles(nombrerol)')
            .eq('idusuario', payload.sub)
            .maybeSingle<any>();

          const dbRol = (data?.roles?.nombrerol || '').toString().toLowerCase();
          if (dbRol.includes('admin')) {
            role = UserRole.ADMIN;
          } else if (dbRol.includes('entrenador') || dbRol.includes('trainer')) {
            role = UserRole.TRAINER;
          } else {
            role = UserRole.USER;
          }
        } catch {
          role = UserRole.USER;
        }
      }
    }

    return {
      userId: payload.sub,
      email: payload.email,
      rol: payload.rol,
      role,
    };
  }
}
