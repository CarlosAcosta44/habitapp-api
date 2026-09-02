# HabitApp API - Documentación de Endpoints

Esta documentación explica cómo interactuar con el backend de HabitApp, el cual sirve tanto a la aplicación web (Next.js) como a la futura aplicación móvil (Flutter/React Native).

## 1. Flujo de Autenticación (JWT) y App Móvil

El backend de HabitApp utiliza **Supabase Auth** como su motor de autenticación principal. Todos los endpoints (excepto los públicos) están protegidos y requieren un token JWT válido.

### ¿Cómo autenticarse desde la App Móvil?

Tienes dos opciones para autenticarte desde la app móvil:

**Opción A (Recomendada): Usar el SDK de Supabase nativo**
1. Instala el SDK de Supabase en tu app móvil.
2. Usa `supabase.auth.signInWithPassword()` para hacer login directamente.
3. Extrae el `access_token` de la respuesta de Supabase.
4. Envíalo al backend en cada petición usando el header:
   `Authorization: Bearer <tu_access_token>`

**Opción B: Usar los endpoints del Backend**
1. Haz una petición POST a `/api/v1/auth/login` con tu email y password.
2. El backend (que actúa como proxy de Supabase) te devolverá un JSON con `access_token` y `refresh_token`.
3. Usa ese `access_token` en el header `Authorization: Bearer <token>` para tus siguientes peticiones.

---

## 2. Swagger UI (Explorador Interactivo)

El backend expone una interfaz visual interactiva impulsada por **Swagger (OpenAPI)**.

1. **URL de Acceso:** Levanta el servidor backend y abre en tu navegador: [http://localhost:4000/api-docs](http://localhost:4000/api-docs)
2. **Cómo usar JWT en Swagger:** 
   - Haz clic en el botón verde **"Authorize"** en la parte superior derecha.
   - Pega tu `access_token` en el formato: `Bearer eyJhbG...` (asegúrate de escribir la palabra "Bearer" seguida de un espacio y tu token).
   - Haz clic en "Authorize" y luego en "Close". A partir de ahora, todas las pruebas desde Swagger enviarán tu token correctamente.

---

## 3. Diccionario de Endpoints Principales

### 🔐 Módulo: Auth (`/api/v1/auth`)
*Endpoints diseñados principalmente para clientes que no usan el SDK directo.*
- **POST `/register`**: Crea una cuenta nueva en Supabase.
- **POST `/login`**: Inicia sesión y devuelve `access_token` y `user`.

### 👤 Módulo: Users (`/api/v1/users`)
- **GET `/me`**: Obtiene el perfil completo del usuario autenticado.
- **PATCH `/me`**: Actualiza nombre, apellido, teléfono, etc.
- **POST `/me/avatar`**: Sube una imagen (JPG/PNG) y actualiza la foto de perfil en el bucket de Supabase.
- **PATCH `/me/fcm-token`**: *(Nuevo)* Registra el token de Firebase Cloud Messaging del dispositivo móvil para recibir notificaciones Push.

### ⭐ Módulo: Habits (`/api/v1/habits`)
- **GET `/dashboard`**: Obtiene el listado de hábitos activos y su estado de cumplimiento en el día actual (Ideal para la pantalla principal).
- **GET `/`**: Obtiene todos los hábitos del usuario.
- **POST `/`**: Crea un nuevo hábito personalizado.
- **PATCH `/:id`**: Edita un hábito.
- **DELETE `/:id`**: Elimina un hábito y todos sus registros en cascada.

### 📅 Módulo: Records (`/api/v1/records`)
- **POST `/completar`**: Marca un hábito como completado en una fecha específica y otorga puntos al usuario automáticamente.
- **DELETE `/desmarcar/:habitoId`**: Deshace el marcado de un hábito.
- **GET `/racha/:habitoId`**: Calcula la racha actual e histórica de un hábito.
- **GET `/historial`**: Devuelve un *heatmap* (mapa de calor) de los últimos 90 días de actividad del usuario.

### 👥 Módulo: Friends (`/api/v1/friends`)
- **GET `/`**: Lista todos los amigos aprobados del usuario.
- **GET `/suggestions`**: Sugiere usuarios nuevos para agregar basados en amigos en común.
- **POST `/`**: Envía una solicitud de amistad.
- **POST `/:id/accept`**: Acepta una solicitud entrante.
- **POST `/:id/reject`**: Rechaza una solicitud entrante.
- **DELETE `/:id`**: Elimina un amigo de la lista.

### 💬 Módulo: Community (`/api/v1/community`)
- **GET `/forums`**: Lista hilos y discusiones creadas por la comunidad.
- **POST `/forums`**: Permite al usuario crear un nuevo hilo de discusión.
- **GET `/forums/:id/comments`**: Obtiene los comentarios de un hilo específico.
- **POST `/comments`**: Agrega un comentario a un hilo.
- **PUT `/comments/:id`**: Edita un comentario propio.
- **DELETE `/comments/:id`**: Elimina un comentario propio.
- **POST `/react`**: Da "Me gusta" o quita "Me gusta" a un comentario.

### 🏆 Módulo: Reports & Gamification (`/api/v1/reports`)
- **GET `/ranking`**: Lista el Top 10 de usuarios globales según su cantidad de puntos.

### 🔔 Módulo: Notifications (`/api/v1/notifications`)
- **GET `/`**: Obtiene la bandeja de entrada de notificaciones del usuario (misiones cumplidas, mensajes de entrenador, solicitudes de amistad).
- **PATCH `/:id/read`**: Marca una notificación específica como leída.
- **PATCH `/read-all`**: Marca todas las notificaciones pendientes como leídas de golpe.
