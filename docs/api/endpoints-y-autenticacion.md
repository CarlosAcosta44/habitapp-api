# Endpoints y Autenticación Custom

Toda la documentación interactiva y la prueba de los endpoints se realiza usando **Swagger**.

## 1. Acceder a Swagger
1. Inicia el servidor (`npm run start:dev`).
2. Abre tu navegador en: `http://localhost:4000/api-docs`

## 2. Flujo de Autenticación
1. Haz una petición POST a `/auth/login` o `/auth/register`.
2. El servidor te devolverá un `access_token` (JWT).
3. En Swagger, haz clic en el botón verde **"Authorize"** arriba a la derecha.
4. En el campo "Bearer Auth", pega tu JWT y haz clic en "Authorize".
5. ¡Listo! Ya puedes probar rutas protegidas (aparecen con un candado 🔒).

## 3. Autorización basada en Roles
Algunas rutas están marcadas con el decorador `@Roles('Administrador')`. Si el `idrol` en tu JWT no coincide, el servidor devolverá un error `403 Forbidden`.

## 4. Endpoints de Retos y Gamificación
- `GET /api/v1/users/community/retos`: Lista todos los retos. Si se envía el Bearer Token, incluye el progreso del usuario, estado de inscripción, completado y el indicador `checkin_hecho_hoy`.
- `POST /api/v1/users/community/retos`: Crea un nuevo reto con su icono visual, fecha de inicio/fin y meta de días (`diasObjetivo`). Recompensa fijada en 50 pts por defecto. Inscribe automáticamente al creador.
- `POST /api/v1/users/community/retos/:id/checkin`: Registra el avance diario (+1 día). Restringido a 1 check-in por día. Si se alcanza el 100%, otorga puntos, registra historial, envía notificación y desbloquea logros asociados.
- `POST /api/v1/users/community/retos/:id/join`: Permite al usuario unirse a un reto vigente.
- `POST /api/v1/users/community/retos/:id/leave`: Permite abandonar un reto en curso.
- `GET /api/v1/users/community/stats`: Retorna estadísticas comunitarias reales (`totalMiembros` activos en `gestion.usuarios`).
