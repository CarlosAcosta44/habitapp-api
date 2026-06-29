# HabitApp API - Documentación del Proyecto

## ¿Qué es HabitApp API? (Lo más importante)
HabitApp API es el motor principal (Backend) que da vida a la aplicación de seguimiento de hábitos "HabitApp". Su objetivo principal es servir como intermediario seguro entre el Frontend (la interfaz que ve el usuario desplegada en Vercel) y la Base de Datos. 

Aquí es donde se expone la lógica de negocio a través de una API RESTful, se valida quién puede ver qué información, y se conectan características clave como los perfiles de usuario, la relación entre entrenadores y clientes, y la verificación de permisos.

---

## ¿Por qué elegimos estas tecnologías?

Para construir este backend de forma robusta, moderna y escalable, tomamos decisiones tecnológicas muy específicas:

1. **NestJS (Framework Backend)**
   - **Por qué:** NestJS obliga a tener un código ordenado. A diferencia de un backend simple en Express donde todo puede terminar mezclado, NestJS usa una arquitectura modular orientada a objetos (similar a Angular o Spring Boot). Esto nos permite separar la autenticación, los usuarios y los entrenadores en carpetas independientes. Además, utiliza TypeScript por defecto, lo que previene errores tipográficos y de lógica antes de compilar.

2. **Supabase (Base de datos y Autenticación)**
   - **Por qué:** Supabase nos proporciona una base de datos PostgreSQL escalable en la nube, pero su mayor ventaja es su sistema de **Autenticación nativo e integrado**. Nos ahorra semanas de trabajo en encriptación de contraseñas y generación de tokens de sesión. Nuestro backend simplemente utiliza el cliente de Supabase para validar tokens y ejecutar consultas SQL de forma segura.

3. **Validación Segura con Vistas SQL (`perfiles_usuarios_api`)**
   - **Por qué:** En lugar de exponer directamente las tablas núcleo (como `usuarios` o `auth.users`), el proyecto utiliza vistas SQL dedicadas. Esto es una excelente práctica de seguridad porque limita exactamente qué columnas puede leer y escribir el backend o frontend, previniendo fuga de datos sensibles y facilitando el mantenimiento.

4. **Autenticación basada en JWT (JSON Web Tokens)**
   - **Por qué:** En lugar de guardar "sesiones" pesadas en la memoria del servidor, usamos JWT firmados asimétricamente. Cuando un usuario inicia sesión en el frontend, obtiene este token. NestJS (usando nuestro `JwtAuthGuard`) solo tiene que verificar la validez del token con Supabase de forma rápida. Esto hace que nuestro servidor sea "stateless" (sin estado), ideal para escalar fácilmente.

5. **Swagger (Documentación Interactiva Automática)**
   - **Por qué:** Swagger auto-genera una página web (`/api/docs`) donde tú y el equipo pueden ver exactamente qué rutas existen, qué parámetros enviar, y probar los endpoints en tiempo real desde el propio navegador. Evita por completo la necesidad de mantener documentos PDF de la API que se desactualizan rápido.

---

## ¿Cómo funciona el proyecto? (Estructura de Módulos)

El proyecto está organizado en **Módulos**, cada uno con una responsabilidad única.

### 1. Módulo de Seguridad y Autenticación (`AuthModule`)
Actúa como el **portero de seguridad** principal del edificio.
- **¿Qué hace?** Implementa el guardián `JwtAuthGuard`. Cada vez que alguien pide datos protegidos a cualquier endpoint de la API, el guardián extrae el token JWT de las cabeceras, le pide a Supabase que valide su firma, busca el rol del usuario en la vista `perfiles_usuarios_api` (Usuario, Entrenador o Administrador), y deja pasar la petición solo si el usuario existe y está activo.

### 2. Módulo de Usuarios (`UsersModule`)
Maneja toda la información personal y de perfil.
- **¿Qué hace?** Expone endpoints de perfil (`GET /api/v1/users/me`, `PATCH /api/v1/users/me`), listado administrativo (`GET /api/v1/users`) y cambio de rol (`PATCH /api/v1/users/:id/role`). Usa la vista `perfiles_usuarios_api` y el esquema `gestion.usuarios`.

### 3. Módulo de Entrenadores (`CoachModule`)
Una característica clave de HabitApp es el seguimiento a los usuarios por parte de expertos.
- **¿Qué hace?** Contiene la lógica para que un usuario con rol `entrenador` pueda consultar la lista de clientes que tiene asignados (ej. `GET /api/v1/coach/clients`), uniendo los datos de la tabla de asignaciones con los perfiles públicos de cada cliente.

### 4. Módulo de Base de Datos (`SupabaseModule`)
El motor de conexión interno.
- **¿Qué hace?** Es el encargado de centralizar la conexión a la base de datos usando la "llave maestra" (`service_role` key) configurada en las variables de entorno. Se inyecta (provee) en los demás módulos para que ellos solo tengan que ejecutar consultas (`.from('tabla')`) sin preocuparse por la inicialización.
