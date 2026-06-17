import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
      'API backend de HabitApp. Expone endpoints de autenticación vía Supabase JWT, ' +
        'gestión de perfiles de usuario, operaciones de entrenador (coach) y health check. ' +
        'Todos los endpoints protegidos requieren un Bearer token de Supabase.',
    )
    .setVersion('1.0.0')
    .setContact('Carlos Acosta — Tech Lead', '', 'carlos@habitapp.io')
    .setLicense('UNLICENSED', '')
    .addServer(
      `http://localhost:${process.env.PORT || 4000}`,
      'Desarrollo local',
    )
    .addServer(
      process.env.BACKEND_URL || 'https://habitapp-api.azurewebsites.net',
      'Producción',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Token JWT emitido por Supabase Auth. Incluir en el header: Authorization: Bearer <token>',
      },
      'supabase-jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
