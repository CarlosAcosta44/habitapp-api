# Arquitectura de Software HabitApp

**Estado:** Decisión oficial vigente  
**Enfoque:** Arquitectura modular NestJS inspirada en Clean Architecture  
**Alcance:** Frontend Next.js, Backend NestJS y Supabase  
**Última actualización:** Septiembre 2026

---

## 1. Decisión Arquitectónica

HabitApp utiliza una **arquitectura modular profesional basada en NestJS e inspirada en principios de Clean Architecture**.

No se implementa una Clean Architecture estricta con carpetas `domain/`, `application/`, `infrastructure/` y `presentation/` replicadas en cada módulo. Esa estructura se considera innecesariamente compleja para el contexto actual del proyecto.

La decisión busca equilibrar:

- Escalabilidad.
- Mantenibilidad.
- Productividad del equipo.
- Simplicidad.
- Entregas académicas frecuentes.

---

## 2. Estructura de Carpetas del Backend

```text
src/
├── config/                          # Variables de entorno y configuración global
├── common/                          # Elementos transversales reutilizables
│   ├── decorators/                  # @CurrentUser, @Roles
│   ├── guards/                      # JwtAuthGuard, RolesGuard
│   ├── filters/
│   ├── interceptors/
│   └── pipes/
│
├── supabase/                        # Cliente Supabase centralizado
│   ├── services/
│   │   └── supabase.service.ts      # Único punto de acceso al cliente Supabase
│   └── supabase.module.ts
│
├── auth/                            # Autenticación JWT via Supabase
│   ├── controllers/
│   ├── dto/                         # LoginDto, RegisterDto, ForgotPasswordDto
│   ├── guards/                      # OAuth guards (Google, Facebook, etc.)
│   ├── repositories/                # AuthRepository (Supabase Auth API)
│   ├── services/                    # AuthService
│   └── auth.module.ts
│
├── users/                           # Gestión de usuarios, hábitos y comunidad
│   ├── controllers/                 # UsersController, HabitsController,
│   │                                # RecordsController, FriendsController,
│   │                                # ComunidadController
│   ├── dto/                         # UserProfileDto, CreateHabitDto, CreateRecordDto, etc.
│   ├── entities/                    # UserProfileEntity (tipos de dominio)
│   ├── repositories/                # UsersRepository, HabitsRepository,
│   │                                # RecordsRepository, FriendsRepository,
│   │                                # CommunityRepository
│   ├── services/                    # UsersService, HabitsService, RecordsService,
│   │                                # FriendsService, CommunityService
│   └── users.module.ts
│
├── coach/                           # Funcionalidades del entrenador
│   ├── controllers/                 # CoachController
│   ├── dto/                         # CreateRoutineDto, UpdateRoutineDto, ClientDto
│   ├── entities/                    # CoachEntity (Routine, ClientAssignment, etc.)
│   ├── repositories/                # CoachRepository
│   ├── services/                    # CoachService
│   └── coach.module.ts
│
├── admin/                           # Administración del sistema
│   ├── controllers/                 # AdminController, QuotesController
│   ├── dto/                         # AdminDto (DeleteForumResponseDto, DailyQuoteDto)
│   ├── entities/                    # AdminEntity (ForumEntity, CommentEntity)
│   ├── repositories/                # AdminRepository, QuotesRepository
│   ├── services/                    # AdminService, QuotesService
│   └── admin.module.ts
│
├── reports/                         # Reportes y estadísticas
│   ├── controllers/                 # ReportsController
│   ├── dto/                         # ReportsDto (RankingEntryDto, UserSummaryDto, etc.)
│   ├── entities/                    # ReportEntity (RankingEntry, UserSummary, HabitStats)
│   ├── repositories/                # ReportsRepository
│   ├── services/                    # ReportsService
│   └── reports.module.ts
│
├── notifications/                   # Notificaciones y correos
│   ├── controllers/                 # NotificationsController
│   ├── dto/                         # NotificationDto, CreateNotificationDto
│   ├── entities/                    # NotificationEntity (NotificationRow)
│   ├── repositories/                # NotificationsRepository
│   ├── services/                    # NotificationsService, EmailService
│   └── notifications.module.ts
│
├── health/                          # Health check endpoint
│   ├── controllers/
│   └── health.module.ts
│
└── main.ts                          # Bootstrap de la aplicación
```

---

## 3. Flujo de Datos — Regla de Capas

El flujo de una request sigue **siempre** esta dirección, sin excepciones:

```
HTTP Request
    │
    ▼
Controller          → Valida guards, extrae params, delega al Service. NUNCA toca Supabase.
    │
    ▼
Service             → Aplica reglas de negocio, orquesta llamadas. NUNCA toca Supabase.
    │
    ▼
Repository          → Único lugar donde se usa SupabaseService o cualquier client externo.
    │
    ▼
SupabaseService     → Proporciona el cliente Supabase con service_role key.
    │
    ▼
Supabase (PostgreSQL / Auth / Storage)
```

> **Regla de oro:** Si un `Service` importa `SupabaseService`, es una violación arquitectónica.  
> **Regla de oro:** Si un `Controller` importa un `Repository` o `SupabaseService`, es una violación arquitectónica.

---

## 4. Responsabilidades por Capa

| Capa | Archivo | Responsabilidad |
|------|---------|----------------|
| `Controller` | `*.controller.ts` | Exponer endpoints HTTP. Aplicar guards y decorators. Extraer parámetros. Delegar al Service. |
| `Service` | `*.service.ts` | Implementar la lógica de negocio. Orquestar múltiples llamadas a repositorios. Transformar y validar datos de negocio. |
| `Repository` | `*.repository.ts` | Acceder a Supabase/PostgreSQL. Mapear filas de DB a entidades. Lanzar excepciones técnicas (`NotFoundException`, `InternalServerErrorException`). |
| `DTO` | `*.dto.ts` | Definir contratos de entrada y salida. Documentar con `@ApiProperty` de Swagger. Validar con `class-validator`. |
| `Entity` | `*.entity.ts` | Representar los tipos de dominio del módulo. Son interfaces o clases simples, sin lógica de DB. |
| `Guard` | `*.guard.ts` | Verificar autenticación JWT y autorización de roles. Implementados en `common/guards/` y reutilizados en todos los módulos. |
| `SupabaseModule` | `supabase.service.ts` | Centralizar la creación y ciclo de vida del cliente Supabase. Exportado para ser importado por cualquier módulo que lo necesite. |

---

## 5. Seguridad

- **`JwtAuthGuard`**: Valida el JWT emitido por Supabase. Aplicado a todos los endpoints protegidos.
- **`RolesGuard`**: Verifica el rol del usuario (`Admin`, `Entrenador`, `Usuario`). Se usa junto con el decorador `@Roles()`.
- **`ThrottlerGuard`**: Rate limiting global (100 req / 60s). Configurado en `AppModule`.
- **`SentryGlobalFilter`**: Captura errores no controlados y los reporta a Sentry.
- El decorador `@CurrentUser()` extrae automáticamente el usuario autenticado del request.

---

## 6. Frontera Supabase — NestJS

| Supabase gestiona | NestJS asume |
|-------------------|--------------|
| Autenticación y emisión de JWT | Validación JWT en cada request |
| PostgreSQL con Row Level Security (RLS) | Operaciones privilegiadas con `service_role` key |
| Storage (bucket de avatares) | Orquestación del flujo de carga de imágenes |
| Triggers y funciones SQL atómicas | Lógica de negocio compleja (Coach, Reports, Admin) |
| Datos de usuario protegidos por RLS | Swagger, rate limiting, logging y auditoría |

---

## 7. Módulos y Sus Dependencias

```
AppModule
├── HealthModule
├── SupabaseModule          ← Importado por todos los módulos con Repositories
├── AuthModule              ← Exporta JwtAuthGuard, RolesGuard
├── UsersModule             ← Exporta UsersService (usado por AdminModule)
├── CoachModule             ← Importa ReportsModule (para progreso de clientes)
├── ReportsModule           ← Exporta ReportsService (usado por CoachModule)
├── NotificationsModule
└── AdminModule             ← Importa UsersModule (para gestión de usuarios)
```

---

## 8. Convenciones Obligatorias

| Convención | Regla |
|------------|-------|
| Nomenclatura | Sufijos: `*Service`, `*Repository`, `*Controller`, `*Dto`, `*Module`, `*Entity` |
| Prefijos de ruta | `/users`, `/coach`, `/admin`, `/reports`, `/notifications` |
| Guards en endpoints protegidos | Usar `@UseGuards(JwtAuthGuard)` y `@UseGuards(JwtAuthGuard, RolesGuard)` según corresponda |
| Swagger | Todo endpoint público debe tener `@ApiOperation`, `@ApiResponse` y `@ApiBearerAuth` |
| DTOs tipados en Swagger | Los `@ApiResponse` con `type:` deben apuntar a una clase DTO real, no a `any` |
| Importaciones cruzadas | Solo a través de `exports` del módulo; nunca importar archivos directamente entre módulos |
| Acceso a Supabase | Exclusivamente desde `*.repository.ts`. Prohibido en `*.service.ts` y `*.controller.ts` |

---

## 9. Frontend — Arquitectura Actual

El frontend (Next.js) mantiene su propia estructura por capas:

```text
UI / Page (React Component)
    └── Server Action / Hook
            └── Service (fetch al backend NestJS o Supabase directo)
                    └── Repository (API client o Supabase client)
                            └── NestJS Backend / Supabase
```

Las nuevas funcionalidades de **Admin, Coach, Reports y Notifications** se integran exclusivamente vía el backend NestJS usando un `api-client` centralizado en el frontend.

---

## 10. Verificación de Cumplimiento

Para verificar que la arquitectura se respeta en cualquier momento, ejecutar:

```bash
# 1. No debe retornar ningún archivo
grep -rn "SupabaseService" src/ --include="*.service.ts" | grep -v "supabase.service.ts"

# 2. No debe retornar ningún archivo  
grep -rn "SupabaseService" src/ --include="*.controller.ts"

# 3. No debe retornar ningún archivo
grep -rn "Repository" src/ --include="*.controller.ts" | grep -v "import"

# 4. Debe terminar con 0 errores
npx tsc --noEmit
```

---

**Conclusión:** HabitApp adopta una arquitectura modular NestJS pragmática y mantenible. La separación en capas (Controller → Service → Repository → Supabase) es la regla fundamental no negociable. Los principios de Clean Architecture se aplican donde aportan claridad real, sin añadir complejidad innecesaria.
