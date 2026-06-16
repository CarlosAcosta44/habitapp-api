# Migraciones Supabase — HabitApp API

Migraciones versionadas del esquema PostgreSQL de HabitApp, portadas desde `habitapp/.docs/base-datos/sql/`.

**Rama GitFlow:** `feature/be-supabase-migrations`  
**Issue:** ISSUE-010 (plan maestro)

## Orden de migraciones

| Archivo | Origen | Contenido |
|---------|--------|-----------|
| `20250616000001_schemas_and_tables.sql` | `estructura-datos/1. Script Esquemas & DB.sql` | Esquemas, tablas, triggers, datos iniciales |
| `20250616000002_field_constraints.sql` | `estructura-datos/2. Script Restricciones (Campo).sql` | Constraints adicionales |
| `20250616000003_indexes.sql` | `estructura-datos/3. Script Indices NonClustered.sql` | Índices |
| `20250616000004_programmable_objects.sql` | `consultas-analitica/4. Objetos Programables.sql` | Funciones, vistas, procedimientos |
| `20250616000005_rls_policies.sql` | `seguridad/1. RLS_Politicas.sql` | Funciones de seguridad y RLS base |
| `20250616000006_rls_missing_policies.sql` | ISSUE-010 | RLS faltante + reducción de GRANT `anon` |

Los datos sintéticos masivos **no** se incluyen en migraciones. Usar `habitapp/.docs/base-datos/sql/estructura-datos/4. Script Datos Sinteticos Masivos.sql` solo en entornos de desarrollo.

## Requisitos

- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado
- Proyecto Supabase vinculado (`supabase link`)

## Aplicar migraciones

```bash
# Desde la raíz de habitapp-api
supabase login
supabase link --project-ref <tu-project-ref>
supabase db push
```

## Verificar RLS

Tras `db push`, confirmar en el dashboard de Supabase que las tablas listadas en ISSUE-010 tienen RLS habilitado y políticas activas:

- `gestion.amigos`, `gestion.logros`, `gestion.usuario_logro`
- `seguimiento.usuario_rutina`, `seguimiento.seguimientos`
- `comunidad.retos`, `comunidad.reto_tareas`, `comunidad.usuario_reto`, `comunidad.usuario_tarea_progreso`

## Sincronización con documentación frontend

La fuente de verdad del SQL vive en `habitapp/.docs/base-datos/sql/`. Cualquier cambio de esquema debe:

1. Actualizarse primero en `.docs/base-datos/sql/`
2. Portarse a una nueva migración en `supabase/migrations/`
3. Documentarse en el PR hacia `develop`
