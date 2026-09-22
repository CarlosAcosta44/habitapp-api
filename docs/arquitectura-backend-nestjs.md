# Arquitectura de Software HabitApp

**Estado:** Decisión oficial vigente  
**Enfoque:** Arquitectura modular NestJS inspirada en Clean Architecture  
**Alcance:** Frontend Next.js, Backend NestJS y Supabase  

---

## 1. Decisión Arquitectónica

HabitApp utilizará una **arquitectura modular profesional basada en NestJS e inspirada en principios de Clean Architecture**.

No se implementará una Clean Architecture estricta con carpetas `domain/`, `application/`, `infrastructure/` y `presentation/` replicadas en cada módulo. Esa estructura se considera innecesariamente compleja para el contexto actual del proyecto.

La decisión busca equilibrar:

- Escalabilidad.
- Mantenibilidad.
- Productividad del equipo.
- Simplicidad.
- Entregas académicas frecuentes.

---

## 2. Backend NestJS Objetivo

```text
src/
├── config/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── pipes/
│   └── dto/
│
├── supabase/
├── auth/
├── health/
│
├── users/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── dto/
│   ├── entities/
│   └── users.module.ts
│
├── coach/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── dto/
│   ├── entities/
│   └── coach.module.ts
│
├── admin/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── dto/
│   ├── entities/
│   └── admin.module.ts
│
├── notifications/
├── reports/
└── main.ts
```

## 3. Reglas de Modularidad

| Elemento | Responsabilidad |
|----------|-----------------|
| `controllers/` | Exponer endpoints HTTP, validar guards y delegar al service |
| `services/` | Implementar reglas de negocio y coordinación del caso de uso |
| `repositories/` | Acceder a Supabase/PostgreSQL y mapear datos |
| `dto/` | Definir contratos de entrada/salida y documentación Swagger |
| `entities/` | Representar estructuras del dominio usadas por el módulo |
| `common/` | Elementos transversales reutilizables |
| `supabase/` | Cliente y servicios base para integración con Supabase |
| `auth/` | Guards, estrategia JWT Supabase y utilidades de autenticación |

## 4. Principios Inspirados en Clean Architecture

- Separar entrada HTTP, lógica de negocio y acceso a datos.
- Mantener dependencias simples y explícitas.
- Evitar que controllers consulten Supabase directamente.
- Evitar que repositories contengan reglas de negocio.
- Centralizar seguridad transversal en guards, decorators y pipes.
- Documentar contratos públicos con Swagger.

## 5. Frontera Supabase - NestJS

| Supabase mantiene | NestJS asume |
|-------------------|--------------|
| Auth y emisión de JWT | Validación JWT en API |
| PostgreSQL y RLS | Operaciones privilegiadas con `service_role` |
| Storage | Orquestación de flujos backend |
| Triggers atómicos | Admin, Coach, Reports y Notifications |
| Datos del usuario protegidos por RLS | Integraciones, Swagger, rate limit y auditoría |

## 6. Frontend Actual

El frontend mantiene su estructura por capas dentro de Next.js:

```text
UI / Page
  └── Server Action
        └── Service
              └── Repository
                    └── Supabase
```

Esta estructura sigue siendo válida para funcionalidades que continúan en Supabase directo y para flujos existentes. Las nuevas funcionalidades administrativas, de entrenador, notificaciones y reportes deben integrarse progresivamente con el backend NestJS mediante un API client.

## 7. Convenciones Obligatorias

- Cada módulo de negocio debe tener `*.module.ts`.
- Los endpoints se agrupan por prefijo: `/users`, `/coach`, `/admin`, `/notifications`, `/reports`.
- Los DTOs usan sufijo `Dto`.
- Los repositories usan sufijo `Repository`.
- Los services usan sufijo `Service`.
- Los controllers usan sufijo `Controller`.
- Los endpoints protegidos usan `SupabaseJwtGuard` y, cuando aplique, `RolesGuard`.
- Swagger debe mantenerse actualizado en cada endpoint público del backend.

---

**Conclusión:** HabitApp no adopta Clean Architecture estricta. La arquitectura oficial es modular NestJS, pragmática y mantenible, tomando de Clean Architecture solo los principios que aportan claridad sin frenar la entrega.
