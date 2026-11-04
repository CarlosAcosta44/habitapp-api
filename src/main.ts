import * as Sentry from '@sentry/nestjs';

// Initialize Sentry before the application starts
Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://placeholder@o0.ingest.sentry.io/0',
  tracesSampleRate: 1.0,
});

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as dns from 'dns';

// Fix Node 18+ fetch timeouts due to IPv6 preference
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // Helmet (Security Headers)
  app.use(helmet());

  // Cookie Parser
  app.use(cookieParser());

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  const configuredOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'https://habitapp.io',
      ];

  if (process.env.FRONTEND_URL && !configuredOrigins.includes(process.env.FRONTEND_URL)) {
    configuredOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, origin?: boolean) => void,
    ) => {
      // Permitir peticiones sin origen (apps móviles nativas o herramientas locales)
      if (!requestOrigin) {
        callback(null, true);
        return;
      }

      const isAllowedOrigin = configuredOrigins.includes(requestOrigin);
      const isLocalDev =
        process.env.NODE_ENV !== 'production' &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin);

      if (isAllowedOrigin || isLocalDev) {
        callback(null, true);
      } else {
        callback(new Error('Petición bloqueada por política CORS'));
      }
    },
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger / OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('HabitApp API')
    .setDescription(
      'API backend de HabitApp. Expone endpoints de autenticación propia, ' +
        'gestión de perfiles de usuario, operaciones de entrenador (coach) y health check. ' +
        'Los endpoints protegidos requieren una cookie de sesión (access_token) o un Bearer token.',
    )
    .setVersion('1.0.0')
    .setContact('Carlos Acosta — Tech Lead', '', 'carlos@habitapp.io')
    .setLicense('UNLICENSED', '')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
    })
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Token JWT propio. Incluir en el header: Authorization: Bearer <token>',
      },
      'jwt',
    )
    .addTag('auth', 'Endpoints de autenticación y tokens')
    .addTag('admin', 'Endpoints exclusivos para administradores')
    .addTag('users', 'Gestión de perfiles de usuario')
    .addTag('coach', 'Operaciones de entrenadores (asignación, rutinas)')
    .addTag('reports', 'Reportes y estadísticas')
    .addTag('notifications', 'Gestión de notificaciones del sistema')
    .addTag('community', 'Foros, artículos y entrenadores de la comunidad')
    .addTag('health', 'Verificación de estado de la API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
}
void bootstrap();

