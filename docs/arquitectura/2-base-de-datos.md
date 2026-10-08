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
