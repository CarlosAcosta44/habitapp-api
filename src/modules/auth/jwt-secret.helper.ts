import { ConfigService } from '@nestjs/config';

/**
 * Resolves the JWT signing/verification secret across supported environment variable keys.
 */
export function resolveJwtSecret(configService: ConfigService): string {
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

  return secret;
}
