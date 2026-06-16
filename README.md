# HabitApp API (Backend V0.1)

El backend de HabitApp está construido con [NestJS](https://nestjs.com/) y sirve como capa orquestadora y protectora para las funcionalidades avanzadas de la aplicación, complementando la infraestructura principal que reside en Supabase.

## Arquitectura

- **NestJS (Node.js)**: Framework principal para crear endpoints escalables y seguros.
- **Supabase**: Base de datos (PostgreSQL), Autenticación (JWT), Row Level Security (RLS) y Triggers.
- **Swagger**: Documentación interactiva de la API.

## Pre-requisitos

- Node.js (v20+)
- NPM o Yarn
- Instancia de Supabase (Proyecto en la nube o Local)

## Configuración Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno:
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Asegúrate de configurar correctamente las siguientes variables con los datos de tu proyecto de Supabase:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`

3. Inicia el servidor de desarrollo:
   ```bash
   npm run start:dev
   ```

## Migraciones Supabase

El esquema de base de datos está versionado en `supabase/migrations/`. Ver guía completa en [`docs/migraciones-supabase.md`](docs/migraciones-supabase.md).

```bash
supabase login
supabase link --project-ref <tu-project-ref>
supabase db push
```

**Rama GitFlow asociada:** `feature/be-supabase-migrations` (ISSUE-010)

## API Docs

Cuando el servidor local está en ejecución, puedes ver y probar todos los endpoints disponibles accediendo a:

[http://localhost:4000/api/docs](http://localhost:4000/api/docs)
