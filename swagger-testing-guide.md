# Guía de Pruebas con Swagger (HabitApp API)

Esta guía te ayudará a probar de manera ágil los endpoints de la API de HabitApp usando **Swagger**, autenticándote rápida y fácilmente sin tener que depender del frontend desplegado en Vercel.

## 1. Acceder a Swagger
Asegúrate de que el backend esté corriendo en local (`npm run start:dev`).
Abre en tu navegador la siguiente ruta:
👉 **[http://localhost:3001/api/docs](http://localhost:3001/api/docs)**

Verás la interfaz gráfica de Swagger UI con todos los módulos listados (`auth`, `users`, `coach`, `admin`, etc.).

## 2. Iniciar Sesión para obtener el Token
En lugar de sacar la cookie de Vercel y decodificarla, ahora puedes generar tu Access Token directamente desde Swagger:

1. Ve a la sección **`auth`**.
2. Haz clic en el endpoint `POST /api/v1/auth/login`.
3. Haz clic en el botón **"Try it out"**.
4. En el campo *Request body*, ingresa tu correo y contraseña:
   ```json
   {
     "email": "tu-correo@ejemplo.com",
     "password": "tu_password_segura"
   }
   ```
5. Haz clic en **Execute**.
6. En la sección *Responses* (abajo), verás un código `200` y un bloque JSON. 
7. Busca el campo `"access_token"`, selecciónalo (sin las comillas) y **cópialo**.

## 3. Autorizar en Swagger (El Candado)
Ahora que tienes el token, debes "Iniciarle sesión" a Swagger para que te permita usar los demás endpoints protegidos:

1. Sube al inicio de la página de Swagger.
2. Haz clic en el botón verde **"Authorize"** (con un ícono de candado abierto).
3. En la ventana que aparece, pega el `access_token` que copiaste en el paso anterior dentro del campo **Value**.
4. Haz clic en **Authorize** y luego en **Close**.

¡Listo! Todos los candados grises de la página ahora deberían verse cerrados. Ya estás autenticado.

## 4. Probar los Endpoints
Ahora puedes probar cualquier endpoint:

**A. Obtener tu propio perfil:**
1. Ve a `users` > `GET /api/v1/users/me`
2. Clic en **Try it out** > **Execute**.
3. Verás tu perfil con tu ID, correo y rol (`UserRole.ADMIN`, `UserRole.COACH` o `UserRole.USER`).

**B. Si eres Admin (Rol `ADMIN`):**
1. Ve a `users` > `GET /api/v1/users` (Listar usuarios).
2. O ve a `admin` > `DELETE /api/v1/admin/forum/threads/{id}` para probar acciones destructivas.

**C. Si eres Coach (Rol `COACH`):**
1. Ve a `coach` > `GET /api/v1/coach/clients` para ver tus pupilos.
2. Crea una rutina en `POST /api/v1/coach/routines`.

> **Nota:** Si intentas ejecutar un endpoint para el cual no tienes permiso (ej: intentas entrar al CRUD de Admin siendo un usuario normal), la respuesta será un error `403 Forbidden` devolviendo "Rol insuficiente". Si el token expiró o falta, devolverá `401 Unauthorized`.
