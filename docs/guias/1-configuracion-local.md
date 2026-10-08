# Guía de Configuración Local

## Requisitos
- Node.js v18+
- Base de datos en Supabase Cloud.

## Instalación
1. Clonar el repositorio.
2. Crear un archivo `.env` basado en `.env.example`:
   ```env
   SUPABASE_URL=tu_url
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role
   JWT_SECRET=secreto_seguro_super_largo
   RESEND_API_KEY=tu_api_key
   PORT=4000
   ```
3. **Importante:** Debido a un bug con Bcrypt en algunas máquinas Linux/Mac, no usar `npm install` tradicional si falla el binding. Usa:
   ```bash
   npm rebuild bcrypt --build-from-source
   ```
   O en su defecto, borra `node_modules` e instala todo desde cero.

## Ejecución
```bash
npm run start:dev
```
