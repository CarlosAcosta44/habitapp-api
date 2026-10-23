# Guía de Despliegue y Migraciones

## 1. Despliegue en Producción
Actualmente, el backend de HabitApp está diseñado para desplegarse fácilmente en servicios como Render, Railway o Vercel (usando serverless). Asegúrate de que las variables de entorno (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) estén configuradas en el proveedor de hosting.

## 2. Migraciones
Las migraciones y cambios en el esquema de la base de datos se deben ejecutar directamente en el SQL Editor de Supabase Cloud. Siempre prueba los cambios localmente en Supabase Local Development antes de subirlos a producción.