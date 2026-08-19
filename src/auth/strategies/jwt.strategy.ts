import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Look for JWT in cookie first, then fallback to Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['access_token'];
          }
          if (!token && request.headers.authorization) {
            const authHeader = request.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
              token = authHeader.split(' ')[1];
            }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }

    // We attach this payload to the request object as req.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'usuario',
    };
  }
}
