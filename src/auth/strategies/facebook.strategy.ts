import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

export interface FacebookProfile {
  facebookId: string;
  email: string;
  nombre: string;
  apellido: string;
  fotoperfil: string | null;
  /**
   * Facebook siempre confirma que el email es válido cuando el scope
   * `email` es otorgado, así que lo marcamos como verificado.
   */
  emailVerified: boolean;
}

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || '',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || '',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || '',
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: FacebookProfile | false) => void,
  ): void {
    const emails = (profile.emails as { value: string }[]) || [];
    const photos = (profile.photos as { value: string }[]) || [];

    const primaryEmail = emails[0]?.value || '';

    if (!primaryEmail) {
      // Sin email no podemos crear la cuenta de forma segura
      done(new Error('No se pudo obtener el email de Facebook.'));
      return;
    }

    const facebookProfile: FacebookProfile = {
      facebookId: profile.id,
      email: primaryEmail,
      nombre: profile.name?.givenName || '',
      apellido: profile.name?.familyName || '',
      fotoperfil: photos[0]?.value || null,
      // Facebook solo devuelve email si el usuario lo autorizó explícitamente
      emailVerified: true,
    };

    done(null, facebookProfile);
  }
}
