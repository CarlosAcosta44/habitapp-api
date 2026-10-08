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
