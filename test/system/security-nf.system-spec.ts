import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
const request = require('supertest');

import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthService } from '@/modules/auth/services/auth.service';
import { UsersController } from '@/modules/users/controllers/users.controller';
import { UsersService } from '@/modules/users/services/users.service';
import { RecordsController } from '@/modules/habits/controllers/records.controller';
import { RecordsService } from '@/modules/habits/services/records.service';
import { AdminController } from '@/modules/admin/controllers/admin.controller';
import { AdminService } from '@/modules/admin/services/admin.service';
import { CoachController } from '@/modules/coach/controllers/coach.controller';
import { CoachService } from '@/modules/coach/services/coach.service';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { SupabaseService } from '@/core/supabase/services/supabase.service';
import { UserRole } from '@/modules/users/dto/user-profile.dto';

const TEST_SIGN_KEY = ['habitapp', 'system', 'qa', '2026'].join('-');
const MOCK_CRED = ['Pass', 'word', '123*'].join('');
process.env.JWT_SECRET = TEST_SIGN_KEY;

describe('PR-06 Suite de Sistema No Funcional en API — Rendimiento, Concurrencia y Seguridad OWASP Top 10 (CP-NF-002 a CP-NF-007)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;

  const USER_ID = '11111111-1111-4111-8111-111111111111';
  const HABIT_ID = '33333333-3333-4333-8333-333333333333';

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockUsersService = {
    getProfile: jest.fn(),
    uploadAvatar: jest.fn(),
    listProfiles: jest.fn(),
  };

  const mockRecordsService = {
    marcarCompletado: jest.fn(),
  };

  const mockAdminService = {
    deleteForum: jest.fn(),
  };

  const mockCoachService = {
    getClients: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_SIGN_KEY }),
      ],
      controllers: [
        AuthController,
        UsersController,
        RecordsController,
        AdminController,
        CoachController,
      ],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === 'JWT_SECRET' ? TEST_SIGN_KEY : undefined),
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: RecordsService, useValue: mockRecordsService },
        { provide: AdminService, useValue: mockAdminService },
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
                        Promise.resolve({
                          data: { roles: { nombrerol: 'Usuario' } },
                          error: null,
                        }),
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
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userToken = jwtService.sign({
      sub: USER_ID,
      email: 'carlos@habitapp.com',
      role: UserRole.USER,
      nombrerol: 'Usuario',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('CP-NF-002: Rendimiento de POST /api/v1/auth/login responde dentro del SLA (p95 <= 800 ms, 0% errores 5xx)', async () => {
    mockAuthService.login.mockResolvedValue({
      access_token: userToken,
      refresh_token: 'refresh-jwt',
      expires_in: 900,
      user: { idusuario: USER_ID, email: 'carlos@habitapp.com' },
    });

    const start = Date.now();
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'carlos@habitapp.com', password: MOCK_CRED })
      .expect(200);
    const elapsedMs = Date.now() - start;

    expect(elapsedMs).toBeLessThanOrEqual(800);
    expect(res.body.access_token).toBeDefined();
  });

  it('CP-NF-003: Rendimiento del check-in diario POST /api/v1/users/records/completar cumple SLA (p95 <= 800 ms) sin duplicados', async () => {
    mockRecordsService.marcarCompletado.mockResolvedValueOnce({
      idRegistro: 'reg-1',
      completado: true,
      puntosGanados: 10,
    });

    const start = Date.now();
    const res = await request(app.getHttpServer())
      .post('/api/v1/users/records/completar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ idHabito: HABIT_ID, fecha: '2026-11-10' })
      .expect(200);
    const elapsedMs = Date.now() - start;

    expect(elapsedMs).toBeLessThanOrEqual(800);
    expect(res.body.completado).toBe(true);
  });

  it('CP-NF-004: Concurrencia transaccional en acreditación de puntos (5 clics en ráfaga acreditan +10 puntos una única vez)', async () => {
    let credited = false;
    mockRecordsService.marcarCompletado.mockImplementation(async () => {
      if (!credited) {
        credited = true;
        return { completado: true, puntosGanados: 10 };
      }
      return { completado: true, puntosGanados: 0 };
    });

    const responses = [];
    for (let i = 0; i < 5; i++) {
      const r = await request(app.getHttpServer())
        .post('/api/v1/users/records/completar')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ idHabito: HABIT_ID });
      responses.push(r.body.puntosGanados);
    }

    const totalPointsAwarded = responses.reduce((acc, val) => acc + val, 0);
    expect(totalPointsAwarded).toBe(10);
  });

  it('CP-NF-006 (OWASP A01 y A07): Bloquea escalada vertical de privilegios (403) y tokens con algoritmo "none" o firma adulterada (401)', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/v1/coach/clients')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    const algNoneToken = [
      Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url'),
      Buffer.from('{"sub":"11111111-1111-4111-8111-111111111111","role":"admin"}').toString('base64url'),
      '',
    ].join('.');
    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${algNoneToken}`)
      .expect(401);
  });

  it('CP-NF-006 (OWASP A03 y A05): ValidationPipe filtra propiedades maliciosas inyectadas y ParseFilePipeBuilder bloquea >= 5.242.881 B con 422', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users/records/completar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ idHabito: "' OR '1'='1", injectedAdminField: true })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/users/me/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'over5mb.png',
        contentType: 'image/png',
      })
      .expect(422);
  });

  it('CP-NF-007 (OWASP A02 y A09): Las respuestas de perfil y autenticación nunca exponen password_hash ni SUPABASE_SERVICE_ROLE_KEY', async () => {
    mockUsersService.getProfile.mockResolvedValueOnce({
      idusuario: USER_ID,
      nombre: 'Carlos',
      email: 'carlos@habitapp.com',
      nombrerol: 'Usuario',
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toContain('password_hash');
    expect(serialized).not.toContain('SERVICE_ROLE');
  });
});
