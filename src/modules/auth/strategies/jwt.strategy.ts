import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret =
      configService.get<string>('JWT_SECRET') ||
      configService.get<string>('JWT_ACCESS_SECRET') ||
      configService.get<string>('SUPABASE_JWT_SECRET') ||
      process.env.JWT_SECRET ||
      process.env.JWT_ACCESS_SECRET ||
      process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no configurado en variables de entorno');
    }

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
    return { userId: payload.sub, email: payload.email, rol: payload.rol };
  }
}
