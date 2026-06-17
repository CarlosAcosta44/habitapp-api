/**
 * generate-openapi.ts
 *
 * Script para generar el snapshot openapi.yaml del contrato v1.
 * Uso: npm run generate-openapi
 *
 * El archivo resultante (openapi.yaml) se commitea como contrato versionado.
 */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { AppModule } from '../src/app.module';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

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
    .addServer('http://localhost:4000', 'Desarrollo local')
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

  const outputPath = path.resolve(process.cwd(), 'openapi.yaml');
  fs.writeFileSync(outputPath, YAML.stringify(document), 'utf8');

  console.log(`✅  openapi.yaml generado en: ${outputPath}`);
  await app.close();
}

generateOpenApi().catch((err) => {
  console.error('❌  Error al generar openapi.yaml:', err);
  process.exit(1);
});
