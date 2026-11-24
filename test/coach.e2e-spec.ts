import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
const request = require('supertest');

import { CoachController } from '@/modules/coach/controllers/coach.controller';
import { CoachService } from '@/modules/coach/services/coach.service';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { SupabaseService } from '@/core/supabase/services/supabase.service';
import { CacheModule } from '@nestjs/cache-manager';
import { UserRole } from '@/modules/users/dto/user-profile.dto';

const TEST_JWT_SECRET = ['habitapp', 'qa', 'jwt', 'key', '2026'].join('-');
process.env.JWT_SECRET = TEST_JWT_SECRET;

describe('Coach Integration Suite (API ↔ BD) — Routines CRUD & Transactional Assignment (CP-INT-072 a CP-INT-073)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let coachToken: string;
  let userToken: string;

  const COACH_ID = 'aaaa1111-1111-4111-8111-111111111111';
  const CLIENT_ID = 'bbbb2222-2222-4222-8222-222222222222';
  const ROUTINE_ID = 'dddd4444-4444-4444-8444-444444444444';

  const mockCoachService = {
    createRoutine: jest.fn(),
    getRoutines: jest.fn(),
    getRoutineById: jest.fn(),
    updateRoutine: jest.fn(),
    deleteRoutine: jest.fn(),
    assignRoutineToClient: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_JWT_SECRET }),
        CacheModule.register(),
      ],
      controllers: [CoachController],
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
  });

  afterAll(async () => {
    await app.close();
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
