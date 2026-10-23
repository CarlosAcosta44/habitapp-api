# 🧪 Pruebas Unitarias y Calidad de Código (NestJS + Jest)

Este documento detalla la arquitectura de pruebas unitarias implementada en el backend de HabitApp (`habitapp-api`), las suites activas, y las directrices para mantener la suite confiable y desacoplada de dependencias externas.

---

## 🎯 1. Filosofía de Pruebas y Desacoplamiento (Regla de Oro #6)

En el backend de HabitApp, los servicios (`AdminService`, `CoachService`, `CommunityService`, `NotificationsService`, etc.) **nunca interactúan directamente con el cliente de Supabase** en sus pruebas. En su lugar:

1. **Inyección de Dependencias:** Los servicios inyectan **Repositorios dedicados** (`AdminRepository`, `CoachRepository`, `CommunityRepository`, `NotificationsRepository`).
2. **Mocks de Repositorios:** En las pruebas unitarias (`*.spec.ts`), se provee un mock con métodos `jest.fn()` para cada operación de persistencia.
3. **Cero Mocks Encadenados de Supabase:** Queda estrictamente prohibido reintroducir mocks complejos de cadenas de Supabase (`.schema().from().select().eq().single()`), ya que son frágiles y acoplan los tests al proveedor de base de datos.

```
┌──────────────────┐
│  Test Runner     │
│  (Jest Spec)     │
└────────┬─────────┘
         │ Inyecta Mock
         ▼
┌──────────────────┐       ┌────────────────────────┐
│  Service under   │ ────> │  Mock Repository       │
│  Test            │       │  (jest.fn() aislado)   │
└──────────────────┘       └────────────────────────┘
```

---

## 📋 2. Inventario de Pruebas Unitarias Activas

Actualmente el backend cuenta con **5 Test Suites** y **20 pruebas unitarias** pasando al 100%:

### A. Módulo de Comunidad (`src/modules/community/`)
* **Archivo:** `src/modules/community/services/community.service.spec.ts`
* **Pruebas (4 tests):**
  * `cloneHabit`: Valida la clonación de un hábito compartido de la comunidad, actualizando el conteo de clones y asignándolo al `idusuario` UUID autenticado con estado `Activo`.
  * `shareHabit`: Valida la publicación de un hábito personal a la comunidad verificando la pertenencia al usuario y mapeando los atributos y días de la semana.
  * `deleteSharedHabit (propietario)`: Permite eliminar la publicación comunitaria si el `userId` coincide con el dueño registrado.
  * `deleteSharedHabit (no autorizado)`: Lanza `UnauthorizedException` si un usuario intenta eliminar un hábito compartido perteneciente a otro usuario.

### B. Módulo de Administración (`src/modules/admin/`)
* **Archivo:** `src/modules/admin/services/admin.service.spec.ts`
* **Pruebas (5 tests):**
  * `deleteForum`: Eliminación en cascada de foros (admins, suscripciones, comentarios y reacciones). Lanza `NotFoundException` si el foro no existe.
  * `deleteForumComment`: Eliminación moderada de comentarios y sus reacciones asociadas.
  * `banUser`: Bloqueo de usuario cambiando su estado a `'Inactivo'`.
  * `unbanUser`: Reactivación de usuario cambiando su estado a `'Activo'`.
  * `getMetrics`: Cálculo de métricas globales (usuarios totales, foros, hábitos y reportes).

### C. Módulo de Entrenadores / Coach (`src/modules/coach/`)
* **Archivo:** `src/modules/coach/services/coach.service.spec.ts`
* **Pruebas (4 tests):**
  * `getClients`: Obtención de clientes asignados a un entrenador activo.
  * `createRoutine`: Creación de rutinas personalizadas vinculadas al entrenador.
  * `assignRoutine`: Asignación de rutinas a usuarios con fecha de inicio y estado inicial.
  * `getRoutines`: Listado de rutinas creadas por el entrenador.

### D. Módulo de Notificaciones (`src/modules/notifications/`)
* **Archivo de Servicio:** `src/modules/notifications/services/notifications.service.spec.ts`
  * **Pruebas (4 tests):**
    * `createNotification`: Creación de notificación con validación de tipo y receptor.
    * `getNotifications`: Consulta paginada y ordenada de notificaciones de un usuario.
    * `markAsRead`: Marcado de notificación individual como leída.
    * `markAllAsRead`: Marcado masivo de todas las notificaciones pendientes de un usuario.
* **Archivo de Controlador:** `src/modules/notifications/controllers/notifications.controller.spec.ts`
  * **Pruebas (3 tests):**
    * `getNotifications`: Valida la delegación HTTP con el usuario autenticado (`@CurrentUser()`).
    * `markAsRead`: Endpoint `PATCH :id/read`.
    * `markAllAsRead`: Endpoint `PATCH read-all`.

---

## 🚀 3. Comandos de Ejecución

Para correr las pruebas unitarias localmente:

```bash
# Ejecutar todas las pruebas unitarias
npm test

# Modo observador (hot-reload en desarrollo)
npm run test:watch

# Generar reporte de cobertura (Coverage)
npm run test:cov
```

---

## 🛠️ 4. Plantilla para Crear Nuevas Pruebas Unitarias

Al agregar pruebas a un nuevo servicio, utiliza la siguiente estructura recomendada con `@nestjs/testing`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MiServicio } from './mi.service';
import { MiRepository } from '../repositories/mi.repository';

describe('MiServicio', () => {
  let service: MiServicio;
  let repository: jest.Mocked<MiRepository>;

  beforeEach(async () => {
    const mockRepository = {
      obtenerPorId: jest.fn(),
      crear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MiServicio,
        {
          provide: MiRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MiServicio>(MiServicio);
    repository = module.get(MiRepository);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe ejecutar la operación con los parámetros correctos', async () => {
    repository.obtenerPorId.mockResolvedValue({ id: 'uuid-123' } as any);
    const resultado = await service.buscar('uuid-123');
    expect(repository.obtenerPorId).toHaveBeenCalledWith('uuid-123');
    expect(resultado).toBeDefined();
  });
});
```
