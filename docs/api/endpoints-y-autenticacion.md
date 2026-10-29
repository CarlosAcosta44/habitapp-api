# Especificación de Endpoints, Autenticación y Contratos de API — HabitApp

> **Versión de API:** `v1.0.0`  
> **Prefijo Global:** `/api/v1`  
> **Servidor Base Local:** `http://localhost:4000/api/v1`  
> **Documentación Interactiva (Swagger / OpenAPI):** `http://localhost:4000/api/docs`  
> **Arquitectura:** NestJS + TypeScript + Supabase PostgreSQL (acceso vía service role en API)

---

## 1. Esquema de Autenticación y Sesión

### 1.1 Modelo Dual de Tokens (JWT + Refresh Token)
HabitApp implementa autenticación basada en JSON Web Tokens (JWT) desacoplada de Supabase Auth, gestionada nativamente por el backend NestJS:
1. **Access Token (JWT):**
   - **Vigencia:** 15 minutos (`expiresIn: '15m'`, valor numérico devuelto `expires_in: 900`).
   - **Transporte Web:** Cookie HTTP-only `access_token` (`sameSite: 'lax'`, `secure` en producción).
   - **Transporte Móvil / API Client:** Cabecera HTTP `Authorization: Bearer <access_token>`.
   - **Payload Claims:** `{ "userId": string, "email": string, "role": string, "idrol": number, "tipo": "access" }`.
2. **Refresh Token:**
   - **Vigencia:** 7 días (`expiresIn: '7d'`).
   - **Transporte Web:** Cookie HTTP-only `refresh_token`.
   - **Transporte Móvil / API Client:** Campo JSON `{ "refreshToken": "..." }` en `POST /api/v1/auth/refresh`.
   - **Payload Claims:** `{ "userId": string, "tipo": "refresh" }`.

### 1.2 Jerarquía de Roles
- `idrol = 1`: **Administrador** (`UserRole.ADMIN`)
- `idrol = 2`: **Entrenador** (`UserRole.TRAINER` / Coach)
- `idrol = 3`: **Usuario** (`UserRole.USER` / Cliente)

### 1.3 Estados de Cuenta y Suspensión
- `estado_cuenta = 'Activo'`: Permite inicio de sesión y renovación de token.
- `estado_cuenta = 'Suspendido'`: El backend rechaza inmediatamente login y refresh con código HTTP `403 Forbidden` (`Cuenta suspendida`).

---

## 2. Convenciones Globales

- **Formato de Peticiones y Respuestas:** `application/json; charset=utf-8` (salvo subida de archivos que usa `multipart/form-data`).
- **Control de Zona Horaria:** Los endpoints de dashboard, registros y rachas leen la cabecera opcional `x-timezone-offset` (minutos respecto a UTC, ej. `-300` para UTC-5 Colombia) para sincronizar el día calendario local del usuario.
- **Paginación y Filtros:** Parámetros estándar en query string `?page=1&limit=10`.
  - Regla de validación: `page >= 1`, `limit >= 1`. Valores `<= 0` son rechazados con `400 Bad Request` por `ValidationPipe`.
- **Manejo de Errores Estándar:**
  - `400 Bad Request`: Parámetros inválidos o formato no cumple DTO (`class-validator`).
  - `401 Unauthorized`: Token ausente, inválido o expirado.
  - `403 Forbidden`: Rol insuficiente o cuenta suspendida.
  - `404 Not Found`: Recurso no encontrado.
  - `422 Unprocessable Entity`: Restricción de tipo/tamaño de archivo superada.
  - `500 Internal Server Error`: Falla no controlada capturada por Sentry.

---

## 3. Catálogo Completo de Endpoints

### 3.1 Módulo: Autenticación (`/auth`)

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Público | Registra nuevo usuario, sincroniza perfil en BD y emite tokens. | `201`, `400`, `409` |
| `POST` | `/api/v1/auth/login` | Público | Autentica usuario por email y contraseña. Emite cookies y tokens. | `200`, `400`, `401`, `403` |
| `POST` | `/api/v1/auth/refresh` | Público | Renueva `access_token` usando `refresh_token` (cookie o body). | `200`, `401`, `403` |
| `POST` | `/api/v1/auth/logout` | Autenticado | Limpia cookies de sesión en navegador. | `200`, `401` |
| `POST` | `/api/v1/auth/google` | Público | Login/Registro federado validando `idToken` de Google. | `200`, `400`, `401` |
| `POST` | `/api/v1/auth/facebook` | Público | Login/Registro federado validando `accessToken` de Facebook. | `200`, `400`, `401` |
| `POST` | `/api/v1/auth/reset-password` | Público | Solicita correo con token de recuperación de contraseña. | `200`, `400`, `404` |
| `PUT` | `/api/v1/auth/update-password` | Público | Actualiza contraseña recibiendo token de recuperación y nueva clave. | `200`, `400`, `401` |

#### Detalle de Endpoints Clave de Auth:
* **`POST /api/v1/auth/login`**
  ```json
  // Request Body
  {
    "email": "user.01@habitapp.test",
    "password": "Password123!"
  }
  // Response 200 OK
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "expires_in": 900,
    "user": {
      "id": "a1b2c3d4-0000-0000-0000-000000000001",
      "email": "user.01@habitapp.test",
      "nombre": "Usuario",
      "apellido": "Prueba",
      "rol": "Usuario"
    }
  }
  ```
* **`POST /api/v1/auth/refresh`**
  ```json
  // Request Body (opcional si viaja en cookie 'refresh_token')
  {
    "refreshToken": "eyJhbGciOi..."
  }
  // Response 200 OK
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "expires_in": 900
  }
  ```

---

### 3.2 Módulo: Usuarios y Perfil (`/users`)

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/me` | Autenticado | Retorna el perfil completo del usuario en sesión. | `200`, `401`, `500` |
| `PATCH` | `/api/v1/users/me` | Autenticado | Actualiza datos básicos (nombre, apellido, fotoUrl). | `200`, `401`, `422` |
| `POST` | `/api/v1/users/me/avatar` | Autenticado | Sube imagen de avatar a Supabase Storage y actualiza URL. | `201`, `400`, `422` |
| `GET` | `/api/v1/users/me/profile` | Autenticado | Resumen ligero: nombre, avatar y puntos acumulados. | `200`, `401` |
| `GET` | `/api/v1/users/me/stats` | Autenticado | Estadísticas consolidadas (tasa de éxito, racha activa, puntos). | `200`, `401` |
| `GET` | `/api/v1/users/me/points-history` | Autenticado | Historial cronológico de puntos ganados (`?limit=20`). | `200`, `401` |
| `GET` | `/api/v1/users/me/achievements` | Autenticado | Lista de insignias y logros desbloqueados. | `200`, `401` |
| `PATCH` | `/api/v1/users/me/fcm-token` | Autenticado | Registra token FCM de Firebase para notificaciones Push. | `200`, `400`, `401` |

> **Regla de Validación de Avatar (Sección 5.1):**  
> Formatos permitidos: `.png`, `.jpeg`, `.jpg`, `.webp`. Tamaño máximo: **5 MB** (`5 * 1024 * 1024` bytes). Respuestas: `422 Unprocessable Entity` si no coincide el MIME type o excede el peso.

---

### 3.3 Módulo: Amigos (`/users/friends`)

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/friends` | Autenticado | Lista de amistades aceptadas del usuario. | `200`, `401` |
| `GET` | `/api/v1/users/friends/suggestions` | Autenticado | Sugerencias de amigos (`?limit=12`). | `200`, `401` |
| `POST` | `/api/v1/users/friends` | Autenticado | Envía solicitud de amistad (`{ "targetUserId": UUID }`). | `200`, `400`, `401` |
| `POST` | `/api/v1/users/friends/:id/accept` | Autenticado | Acepta solicitud de amistad pendiente. | `200`, `401`, `404` |
| `POST` | `/api/v1/users/friends/:id/reject` | Autenticado | Rechaza solicitud de amistad. | `200`, `401`, `404` |
| `DELETE` | `/api/v1/users/friends/:id` | Autenticado | Elimina una relación de amistad existente. | `200`, `401`, `404` |

---

### 3.4 Módulo: Hábitos (`/users/habits`)

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/habits/dashboard` | Autenticado | Vista unificada: hábitos activos + indicador si fue completado hoy. | `200`, `401` |
| `GET` | `/api/v1/users/habits/categorias` | Autenticado | Catálogo de categorías disponibles (Salud, Productividad, etc.). | `200`, `401` |
| `GET` | `/api/v1/users/habits` | Autenticado | Lista todos los hábitos del usuario (filtro opcional `?estado=Activo`). | `200`, `401` |
| `GET` | `/api/v1/users/habits/:id` | Autenticado | Detalle completo de un hábito por su UUID. | `200`, `401`, `404` |
| `GET` | `/api/v1/users/habits/:id/stats` | Autenticado | Detalle del hábito con racha y tasa de cumplimiento. | `200`, `401`, `404` |
| `POST` | `/api/v1/users/habits` | Autenticado | Crea un nuevo hábito personalizado. | `201`, `400`, `401` |
| `PATCH` | `/api/v1/users/habits/:id` | Autenticado | Actualiza parámetros de un hábito (nombre, frecuencia, meta). | `200`, `400`, `401` |
| `PATCH` | `/api/v1/users/habits/:id/completar`| Autenticado | Marca el estado general del hábito como completado. | `200`, `401`, `404` |
| `DELETE`| `/api/v1/users/habits/:id` | Autenticado | Elimina lógicamente/físicamente el hábito y sus registros. | `200`, `401`, `404` |

---

### 3.5 Módulo: Registros Diarios y Rachas (`/users/records`)

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/records/historial` | Autenticado | Historial completo de check-ins del usuario. | `200`, `401` |
| `GET` | `/api/v1/users/records/habito/:habitoId` | Autenticado | Registros de un hábito específico. | `200`, `401`, `404` |
| `GET` | `/api/v1/users/records/racha/:habitoId` | Autenticado | Retorna `rachaActual` y `rachaMaxima` calculada para el hábito. | `200`, `401`, `404` |
| `POST` | `/api/v1/users/records/completar` | Autenticado | Registra check-in del día (suma puntos, actualiza racha). | `200`, `400`, `401` |
| `DELETE` | `/api/v1/users/records/desmarcar/:habitoId` | Autenticado | Revierte check-in del día (resta puntos, recalcula racha). | `200`, `401`, `404` |
| `PATCH` | `/api/v1/users/records/progreso` | Autenticado | Avanza valor numérico en hábitos cuantitativos (ej. pasos, vasos). | `200`, `400`, `401` |

> **Nota sobre el cálculo de progreso diario (CP-INT-062 / CP-INT-063):**  
> El endpoint `/dashboard` retorna los hábitos individuales y su estado booleano `completadoHoy`. El cálculo porcentual de la barra del día (`completados / total * 100`) es responsabilidad de la capa de presentación (Frontend en `DailyProgress.tsx`).

---

### 3.6 Módulo: Comunidad, Retos y Foros (`/users/community`)

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/community/stats` | Público/Auth | Métricas de comunidad (total miembros activos, foros, etc.). | `200` |
| `GET` | `/api/v1/users/community/foros` | Público/Auth | Lista de foros y temas de debate. | `200` |
| `GET` | `/api/v1/users/community/foros/:id` | Público/Auth | Detalle de un foro específico. | `200`, `404` |
| `POST` | `/api/v1/users/community/foros` | Autenticado | Crea un nuevo foro (`titulo`, `descripcion`, `categoria`). | `201`, `400`, `401` |
| `PUT` | `/api/v1/users/community/foros/:id` | Autenticado | Actualiza título o contenido de un foro propio. | `200`, `401`, `403` |
| `DELETE` | `/api/v1/users/community/foros/:id` | Autenticado | Elimina un foro propio. | `200`, `401`, `403` |
| `POST` | `/api/v1/users/community/upload-image` | Autenticado | Sube imagen adjunta para un foro o comentario. | `201`, `400`, `401` |
| `GET` | `/api/v1/users/community/foros/:id/comentarios` | Público/Auth | Hilos de comentarios de un foro. | `200`, `404` |
| `POST` | `/api/v1/users/community/foros/:id/comentarios` | Autenticado | Agrega comentario o respuesta anidada. | `201`, `400`, `401` |
| `PUT` | `/api/v1/users/community/comentarios/:id` | Autenticado | Actualiza contenido de un comentario propio. | `200`, `401`, `403` |
| `DELETE` | `/api/v1/users/community/comentarios/:id` | Autenticado | Elimina comentario propio. | `200`, `401`, `403` |
| `POST` | `/api/v1/users/community/:targetType/:id/reacciones` | Autenticado | Reacciona (`'Me gusta'\|'Me motiva'\|'Util'`) a foro, comentario o artículo. | `201`, `400`, `401` |
| `GET` | `/api/v1/users/community/retos` | Público/Auth | Lista de retos grupales vigentes y progreso del usuario. | `200` |
| `POST` | `/api/v1/users/community/retos` | Autenticado | Crea un reto público para la comunidad. | `201`, `400`, `401` |
| `POST` | `/api/v1/users/community/retos/:id/unirse` | Autenticado | Inscribe al usuario en el reto grupal. | `201`, `400`, `401` |
| `POST` | `/api/v1/users/community/retos/:id/salir` | Autenticado | Abandona el reto grupal. | `200`, `401`, `404` |
| `POST` | `/api/v1/users/community/retos/:id/checkin` | Autenticado | Check-in diario de avance en el reto (máx. 1 por día). | `200`, `400`, `401` |
| `GET` | `/api/v1/users/community/especialistas` | Público/Auth | Directorio de entrenadores y coaches certificados. | `200` |
| `GET` | `/api/v1/users/community/articulos` | Público/Auth | Artículos educativos publicados por la administración. | `200` |
| `GET` | `/api/v1/users/community/habitos` | Público/Auth | Hábitos compartidos por otros miembros de la comunidad. | `200` |
| `POST` | `/api/v1/users/community/habitos/:id/clonar` | Autenticado | Clona un hábito compartido a la cuenta del usuario (`clones_count + 1`). | `201`, `401`, `404` |
| `POST` | `/api/v1/users/community/habitos/:id/compartir` | Autenticado | Publica un hábito personal en la comunidad. | `201`, `401`, `404` |
| `DELETE` | `/api/v1/users/community/habitos/:id` | Autenticado | Despublica un hábito compartido de la comunidad. | `200`, `401`, `403` |

> **Mapeos de Campos Específicos:**  
> - **Comentario Padre (CP-INT-104):** En el cuerpo JSON del request se envía `"parentId": "<UUID>"`; en la base de datos se almacena en la columna `idcomentario_padre`.  
> - **Contador de Clones (CP-INT-116):** La columna en `comunidad.habitos_publicados` y la propiedad devuelta en la respuesta JSON es `clones_count`.

---

### 3.7 Módulo: Reportes y Analítica (`/reports`)

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/ranking` | Autenticado | Top 100 de usuarios con mayor puntaje. Cacheado por 60 segundos. | `200`, `401` |
| `GET` | `/api/v1/reports/user/:userId` | Autenticado | Resumen consolidado: rachas, volumen y cumplimiento (`?period=week\|month\|year`). | `200`, `401`, `404` |
| `GET` | `/api/v1/reports/user/:userId/habits` | Autenticado | Desglose de cumplimiento porcentual por hábito en los últimos 30 días. | `200`, `401`, `404` |
| `GET` | `/api/v1/reports/user/:userId/comparative` | Autenticado | Reporte comparativo de cumplimiento por categoría para gráficos de radar/barras. | `200`, `401` |

---

### 3.8 Módulo: Entrenador / Coach (`/coach`)

> **Restricción de Rol:** Requiere `@Roles('Entrenador', 'Administrador')`. Cualquier otro rol recibe `403 Forbidden`.

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/coach/clients` | Coach/Admin | Lista de usuarios (pupilos) asignados al entrenador. | `200`, `401`, `403` |
| `GET` | `/api/v1/coach/routines` | Coach/Admin | Lista de plantillas de rutina creadas por el entrenador. | `200`, `401`, `403` |
| `GET` | `/api/v1/coach/routines/:id` | Coach/Admin | Detalle de una rutina y sus hábitos configurados. | `200`, `401`, `404` |
| `POST` | `/api/v1/coach/routines` | Coach/Admin | Crea una nueva rutina estructurada con lista de hábitos. | `201`, `400`, `401`, `403` |
| `PATCH` | `/api/v1/coach/routines/:id` | Coach/Admin | Modifica el nombre o hábitos de una rutina existente. | `200`, `400`, `401`, `403` |
| `DELETE` | `/api/v1/coach/routines/:id` | Coach/Admin | Elimina una plantilla de rutina. | `200`, `401`, `403`, `404` |
| `POST` | `/api/v1/coach/clients/:clientId/routines/:routineId/assign` | Coach/Admin | Asigna e instancia los hábitos de la rutina en el perfil del cliente. | `201`, `401`, `403`, `404` |
| `GET` | `/api/v1/coach/clients/:clientId/progress` | Coach/Admin | Consulta el progreso, racha y estadísticas del cliente asignado. | `200`, `401`, `403`, `404` |

---

### 3.9 Módulo: Administración (`/admin`)

> **Restricción de Rol:** Requiere estrictamente `@Roles('Administrador')`.

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/users` | Admin | Lista completa de perfiles de usuario registrados en el sistema. | `200`, `401`, `403` |
| `PATCH` | `/api/v1/admin/users/:id/role` | Admin | Actualiza el rol de un usuario (`{ "idrol": 1 \| 2 \| 3 }`). | `200`, `400`, `401`, `403` |
| `DELETE` | `/api/v1/admin/forum/:id` | Admin | Moderación: Elimina foros inapropiados y sus respuestas en cascada. | `200`, `401`, `403`, `404` |
| `DELETE` | `/api/v1/admin/forum/comments/:id` | Admin | Moderación: Elimina comentarios específicos en foros. | `200`, `401`, `403`, `404` |
| `GET` | `/api/v1/admin/quotes/daily` | Público/Auth | Frase motivacional del día para el dashboard. | `200` |

---

### 3.10 Módulo: Notificaciones (`/notifications`)

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | Autenticado | Devuelve las últimas 30 notificaciones in-app del usuario logueado. | `200`, `401` |
| `PATCH` | `/api/v1/notifications/:id/read` | Autenticado | Marca una notificación específica como leída (`204 No Content`). | `204`, `401`, `404` |
| `PATCH` | `/api/v1/notifications/read-all` | Autenticado | Marca todas las notificaciones pendientes como leídas (`204 No Content`). | `204`, `401` |

---

### 3.11 Módulo: Monitoreo y Salud (`/health`)

| Método | Endpoint | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Público | Health check para balanceadores y monitoreo de uptime (`{ status: "ok", timestamp }`). | `200` |
| `GET` | `/api/v1/health/debug-sentry` | Público | Dispara un error de prueba intencional para verificar la captura en Sentry. | `500` |

---

## 4. Guía Práctica de Pruebas con Swagger y Clientes HTTP

1. **Levantar el Backend:**
   ```bash
   cd /home/kairos/Proyectos/habitapp-api
   npm run start:dev
   ```
2. **Acceder a Swagger:**  
   Navegar a `http://localhost:4000/api/docs`.
3. **Autenticación en Swagger:**
   - Ejecutar `POST /api/v1/auth/login` con credenciales de prueba.
   - Copiar el valor de `access_token`.
   - Clic en el botón **"Authorize"** en la esquina superior derecha.
   - Pegar el token en el esquema **jwt (http, Bearer)** y guardar.
   - Probar cualquier endpoint protegido con rol adecuado.
