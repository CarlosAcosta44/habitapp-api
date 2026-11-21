import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
const request = require('supertest');

import { CoachController } from '@/modules/coach/controllers/coach.controller';
import { CoachService } from '@/modules/coach/services/coach.service';
import { HabitsController } from '@/modules/habits/controllers/habits.controller';
import { HabitsService } from '@/modules/habits/services/habits.service';
import { ReportsController } from '@/modules/reports/controllers/reports.controller';
import { ReportsService } from '@/modules/reports/services/reports.service';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { SupabaseService } from '@/core/supabase/services/supabase.service';
import { CacheModule } from '@nestjs/cache-manager';
import { UserRole } from '@/modules/users/dto/user-profile.dto';

const TEST_JWT_SECRET = ['habitapp', 'qa', 'jwt', 'key', '2026'].join('-');
process.env.JWT_SECRET = TEST_JWT_SECRET;

describe('Coach Integration Suite — Clients, Read-Only Progress, Routines & Assignment (CP-INT-068 a CP-INT-073)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let coachToken: string;
  let userToken: string;
  let adminToken: string;

  const COACH_ID = 'aaaa1111-1111-4111-8111-111111111111';
  const CLIENT_ID = 'bbbb2222-2222-4222-8222-222222222222';
  const OTHER_CLIENT_ID = 'cccc3333-3333-4333-8333-333333333333';
  const ROUTINE_ID = 'dddd4444-4444-4444-8444-444444444444';

  const mockCoachService = {
    getClients: jest.fn(),
    getClientProgress: jest.fn(),
    createRoutine: jest.fn(),
    getRoutines: jest.fn(),
    getRoutineById: jest.fn(),
    updateRoutine: jest.fn(),
    deleteRoutine: jest.fn(),
    assignRoutineToClient: jest.fn(),
  };

  const mockHabitsService = {
    update: jest.fn(),
  };

  const mockReportsService = {
    getUserSummary: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_JWT_SECRET }),
        CacheModule.register(),
      ],
      controllers: [CoachController, HabitsController, ReportsController],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? TEST_JWT_SECRET : undefined,
          },
        },
        { provide: CoachService, useValue: mockCoachService },
        { provide: HabitsService, useValue: mockHabitsService },
        { provide: ReportsService, useValue: mockReportsService },
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({
              schema: () => ({
                from: () => ({
                  select: () => ({
                    eq: () => ({
                      maybeSingle: () =>
                        Promise.resolve({ data: null, error: null }),
                    }),
                  }),
                }),
              }),
            }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    coachToken = jwtService.sign({
      sub: COACH_ID,
      email: 'coach@habitapp.com',
      role: UserRole.TRAINER,
      nombrerol: 'Entrenador',
    });
    userToken = jwtService.sign({
      sub: CLIENT_ID,
      email: 'user@habitapp.com',
      role: UserRole.USER,
      nombrerol: 'Usuario',
    });
    adminToken = jwtService.sign({
      sub: 'eeee5555-5555-4555-8555-555555555555',
      email: 'admin@habitapp.com',
      role: UserRole.ADMIN,
      nombrerol: 'Administrador',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('CP-INT-068: GET /api/v1/coach/clients retorna pupilos al Entrenador (200), bloquea rol Usuario (403) y sin sesión (401)', async () => {
    mockCoachService.getClients.mockResolvedValueOnce([
      {
        assigned_at: '2026-10-15',
        client: { id: CLIENT_ID, cumplimiento: 50, racha_actual: 3 },
      },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/coach/clients')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(res.body[0].client.cumplimiento).toBe(50);

    await request(app.getHttpServer())
      .get('/api/v1/coach/clients')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    await request(app.getHttpServer()).get('/api/v1/coach/clients').expect(401);
  });

  it('CP-INT-069: GET /coach/clients/:clientId/progress permite lectura (200, TD6-R3) pero PATCH /users/habits/:id rechaza edición (403)', async () => {
    mockCoachService.getClientProgress.mockResolvedValueOnce({
      cumplimiento_global: 50,
      racha_actual: 3,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/coach/clients/${CLIENT_ID}/progress`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    mockHabitsService.update.mockRejectedValueOnce(
      new ForbiddenException('Acceso denegado: vista de solo lectura'),
    );

    await request(app.getHttpServer())
      .patch(`/api/v1/users/habits/${ROUTINE_ID}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ nombre: 'Intento de edición por coach' })
      .expect(403);
  });

  it('CP-INT-070: Lectura cruzada permite al Admin (200, TD6-R2) y bloquea al Entrenador sobre cliente no asignado (404/403, TD6-R4)', async () => {
    mockReportsService.getUserSummary.mockResolvedValueOnce({
      cumplimiento_global: 80,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/reports/user/${OTHER_CLIENT_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    mockCoachService.getClientProgress.mockRejectedValueOnce(
      new NotFoundException('Cliente no asignado al entrenador'),
    );

    await request(app.getHttpServer())
      .get(`/api/v1/coach/clients/${OTHER_CLIENT_ID}/progress`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(404);
  });

  it('CP-INT-071: GET /api/v1/reports/user/:userId sin sesión o con JWT de firma alterada retorna 401 Unauthorized (TD6-R5)', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/reports/user/${CLIENT_ID}`)
      .expect(401);

    await request(app.getHttpServer())
      .get(`/api/v1/reports/user/${CLIENT_ID}`)
      .set('Authorization', `Bearer ${userToken}tampered`)
      .expect(401);
  });

  it('CP-INT-072: POST /api/v1/coach/routines crea con 3 hábitos (201), rechaza 0 hábitos (400) y bloquea rol Usuario (403)', async () => {
    mockCoachService.createRoutine.mockResolvedValueOnce({
      id: ROUTINE_ID,
      name: 'Rutina Maestra',
    });

    await request(app.getHttpServer())
      .post('/api/v1/coach/routines')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        name: 'Rutina Maestra',
        habits: [
          { habit_name: 'Beber agua' },
          { habit_name: 'Meditar' },
          { habit_name: 'Correr' },
        ],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/coach/routines')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Rutina Vacía', habits: [] })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/coach/routines')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Rutina Usuario',
        habits: [{ habit_name: 'Beber agua' }],
      })
      .expect(403);
  });

  it('CP-INT-073: POST /api/v1/coach/clients/:clientId/routines/:routineId/assign clona en 1.ª vez (201) y retorna 409 Conflict en 2.ª vez', async () => {
    mockCoachService.assignRoutineToClient
      .mockResolvedValueOnce({
        message: 'Routine assigned successfully to client',
        habitsAssigned: 3,
      })
      .mockRejectedValueOnce(
        new ConflictException(
          'El cliente ya tiene asignada esta rutina actualmente.',
        ),
      );

    const first = await request(app.getHttpServer())
      .post(`/api/v1/coach/clients/${CLIENT_ID}/routines/${ROUTINE_ID}/assign`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(201);

    expect(first.body.habitsAssigned).toBe(3);

    await request(app.getHttpServer())
      .post(`/api/v1/coach/clients/${CLIENT_ID}/routines/${ROUTINE_ID}/assign`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(409);
  });
});
