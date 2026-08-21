import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  googleId: string;
  email: string;
  nombre: string;
  apellido: string;
  fotoperfil: string | null;
  emailVerified: boolean;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): void {
    const emails: { value: string; verified?: boolean }[] =
      (profile.emails as { value: string; verified?: boolean }[]) || [];
    const photos: { value: string }[] =
      (profile.photos as { value: string }[]) || [];

    const primaryEmail = emails[0]?.value || '';
    const emailVerified = emails[0]?.verified === true;

    const googleProfile: GoogleProfile = {
      googleId: profile.id as string,
      email: primaryEmail,
      nombre: profile.name?.givenName || '',
      apellido: profile.name?.familyName || '',
      fotoperfil: photos[0]?.value || null,
      emailVerified,
    };

    done(null, googleProfile);
  }
}
