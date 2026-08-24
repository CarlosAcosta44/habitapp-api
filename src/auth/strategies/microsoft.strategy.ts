import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';

export interface MicrosoftProfile {
  microsoftId: string;
  email: string;
  nombre: string;
  apellido: string;
  fotoperfil: string | null;
  emailVerified: boolean;
}

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(
  Strategy,
  'microsoft',
) {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID') || '',
      clientSecret:
        configService.get<string>('MICROSOFT_CLIENT_SECRET') || '',
      callbackURL:
        configService.get<string>('MICROSOFT_CALLBACK_URL') || '',
      scope: ['user.read'],
      tenant: 'common', // Acepta cuentas personales y organizacionales
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (error: Error | null, user?: MicrosoftProfile | false) => void,
  ): void {
    // Microsoft devuelve los emails en el campo `emails` o `_json.mail`/`userPrincipalName`
    const emails: { value: string }[] = profile.emails || [];
    const primaryEmail =
      emails[0]?.value ||
      (profile._json?.mail as string | undefined) ||
      (profile._json?.userPrincipalName as string | undefined) ||
      '';

    if (!primaryEmail) {
      done(new Error('No se pudo obtener el email de Microsoft.'));
      return;
    }

    const microsoftProfile: MicrosoftProfile = {
      microsoftId: profile.id as string,
      email: primaryEmail,
      nombre:
        (profile.name?.givenName as string | undefined) ||
        (profile._json?.givenName as string | undefined) ||
        '',
      apellido:
        (profile.name?.familyName as string | undefined) ||
        (profile._json?.surname as string | undefined) ||
        '',
      fotoperfil: null, // Microsoft no devuelve foto de perfil en el flujo básico
      // Las cuentas Microsoft se consideran verificadas si el email no es
      // un userPrincipalName con formato de tenant (terminan en onmicrosoft.com)
      emailVerified: !primaryEmail.endsWith('onmicrosoft.com'),
    };

    done(null, microsoftProfile);
  }
}
