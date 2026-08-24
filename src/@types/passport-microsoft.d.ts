declare module 'passport-microsoft' {
  import { Strategy as PassportStrategy } from 'passport';

  interface MicrosoftStrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    tenant?: string;
    authorizationURL?: string;
    tokenURL?: string;
    profileFields?: string[];
  }

  class Strategy extends PassportStrategy {
    constructor(
      options: MicrosoftStrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: Error | null, user?: any) => void,
      ) => void,
    );
    authenticate(req: any, options?: any): void;
  }
}
