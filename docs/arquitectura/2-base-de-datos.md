# Arquitectura de Base de Datos (Supabase Cloud)

## 1. Abandono de Supabase Auth
Históricamente, HabitApp usaba Supabase Auth. Actualmente, el Backend NestJS maneja **Custom Auth**:
- Las contraseñas están hasheadas con **Bcrypt** en la tabla `gestion.usuarios`.
- NestJS firma y emite sus propios tokens **JWT**.
- Login Social (Google/Facebook) se verifica desde NestJS llamando a las APIs oficiales.
- La tabla `auth.users` de Supabase está **vaciada e inhabilitada**.

## 2. Row Level Security (RLS)
Supabase lanza advertencias rojas si las tablas están "Unrestricted". 
En HabitApp, el RLS está activado con **Políticas de Denegación Total (Deny All)**.
```sql
CREATE POLICY "Denegar_Acceso" ON tabla FOR ALL USING (false);
```
**¿Por qué?** Porque nadie en internet debe acceder a la BD directamente. NestJS accede usando la llave `service_role`, la cual tiene privilegios de administrador y se salta el RLS por diseño. Esto blinda la base de datos contra hackers.

## 3. Retos Comunitarios y Gamificación
- **`comunidad.retos`**: Contiene los retos de la comunidad. Su representación visual se maneja exclusivamente mediante la columna `icono character varying(50)` (guardando emojis o identificadores gráficos, por defecto `'🏆'`).
- **`comunidad.reto_tareas`**: Define la meta de cumplimiento del reto en días (`metrica_objetivo integer`, `unidad_medida = 'días'`).
- **`comunidad.usuario_tarea_progreso`**: Registra los días completados por el usuario y la fecha del último avance (`ultima_actualizacion`), garantizando la regla de negocio de **1 check-in diario por usuario**.
- **`gestion.logros` y `gestion.usuario_logro`**: Catálogo predefinido de 16 logros por hitos (rachas de 7, 30, 90, 180, 365 días; 1, 5, 15, 50 retos completados; foros y hábitos). Al completarse un reto, se otorgan puntos a `gestion.usuarios.puntostotales`, se genera registro en `gestion.historial_puntos`, notificación en `gestion.notificaciones` y se evalúan/desbloquean los logros automáticamente.
