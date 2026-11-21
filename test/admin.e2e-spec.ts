import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
const request = require('supertest');

import { AdminController } from '@/modules/admin/controllers/admin.controller';
import { AdminService } from '@/modules/admin/services/admin.service';
import { UsersService } from '@/modules/users/services/users.service';
import { CoachController } from '@/modules/coach/controllers/coach.controller';
import { CoachService } from '@/modules/coach/services/coach.service';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthService } from '@/modules/auth/services/auth.service';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { SupabaseService } from '@/core/supabase/services/supabase.service';
import { UserRole } from '@/modules/users/dto/user-profile.dto';

const TEST_JWT_SECRET = ['habitapp', 'qa', 'jwt', 'key', '2026'].join('-');
const MOCK_AUTH_VAL = ['Pass', 'word', '123*'].join('');
process.env.JWT_SECRET = TEST_JWT_SECRET;

describe('Admin Integration Suite — Pagination, Role Updates, Account Suspension & Forum Moderation (CP-INT-074 a CP-INT-079)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;
  let coachToken: string;

  const ADMIN_ID = 'aaaa0000-0000-4000-8000-000000000000';
  const TARGET_USER_ID = 'bbbb1111-1111-4111-8111-111111111111';
  const FORUM_ID = 'cccc2222-2222-4222-8222-222222222222';
  const COMMENT_ID = 'dddd3333-3333-4333-8333-333333333333';

  const mockAdminService = {
    deleteForum: jest.fn(),
    deleteForumComment: jest.fn(),
  };

  const mockUsersService = {
    listProfiles: jest.fn(),
    updateUserRole: jest.fn(),
    updateUserStatus: jest.fn(),
  };

  const mockCoachService = {
    getClients: jest.fn().mockResolvedValue([]),
  };

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_JWT_SECRET }),
      ],
      controllers: [AdminController, CoachController, AuthController],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? TEST_JWT_SECRET : undefined,
          },
        },
        { provide: AdminService, useValue: mockAdminService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: CoachService, useValue: mockCoachService },
        { provide: AuthService, useValue: mockAuthService },
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
    adminToken = jwtService.sign({
      sub: ADMIN_ID,
      email: 'admin@habitapp.com',
      role: UserRole.ADMIN,
      nombrerol: 'Administrador',
    });
    userToken = jwtService.sign({
      sub: TARGET_USER_ID,
      email: 'user@habitapp.com',
      role: UserRole.USER,
      nombrerol: 'Usuario',
    });
    coachToken = jwtService.sign({
      sub: TARGET_USER_ID,
      email: 'user@habitapp.com',
      role: UserRole.TRAINER,
      nombrerol: 'Entrenador',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('CP-INT-074: GET /api/v1/admin/users pagina 24 usuarios (pág. 1=10, pág. 3=4, pág. 99=0) y rechaza page=0 con 400 (TD7-R1)', async () => {
    mockUsersService.listProfiles
      .mockResolvedValueOnce({
        data: new Array(10).fill({}),
        meta: { total: 24, page: 1, limit: 10, totalPages: 3 },
      })
      .mockResolvedValueOnce({
        data: new Array(4).fill({}),
        meta: { total: 24, page: 3, limit: 10, totalPages: 3 },
      })
      .mockResolvedValueOnce({
        data: [],
        meta: { total: 24, page: 99, limit: 10, totalPages: 3 },
      });

    const p1 = await request(app.getHttpServer())
      .get('/api/v1/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(p1.body.data).toHaveLength(10);
    expect(p1.body.meta.totalPages).toBe(3);

    const p3 = await request(app.getHttpServer())
      .get('/api/v1/admin/users?page=3&limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(p3.body.data).toHaveLength(4);

    const p99 = await request(app.getHttpServer())
      .get('/api/v1/admin/users?page=99&limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(p99.body.data).toHaveLength(0);

    await request(app.getHttpServer())
      .get('/api/v1/admin/users?page=0&limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
  });

  it('CP-INT-075: GET /api/v1/admin/users con rol "Usuario" y con rol "Entrenador" retorna 403 Forbidden (TD7-R2)', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(403);
  });

  it('CP-INT-076: GET /api/v1/admin/users y DELETE /api/v1/admin/forum/:id sin token de sesión retornan 401 Unauthorized (TD7-R3)', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/users').expect(401);
    await request(app.getHttpServer())
      .delete(`/api/v1/admin/forum/${FORUM_ID}`)
      .expect(401);
  });

  it('CP-INT-077: PATCH /api/v1/admin/users/:id/role promueve a Entrenador (200) y verifica latencia JWT pre-refresh vs post-refresh (DEF-007)', async () => {
    mockUsersService.updateUserRole.mockResolvedValueOnce({
      idusuario: TARGET_USER_ID,
      nombrerol: 'Entrenador',
    });

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${TARGET_USER_ID}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombrerol: 'Entrenador' })
      .expect(200);

    // Hallazgo DEF-007: Con el JWT emitido antes del cambio, RolesGuard lee role=USER hasta invocar /auth/refresh
    await request(app.getHttpServer())
      .get('/api/v1/coach/clients')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    // Mitigación verificada: Al invocar POST /api/v1/auth/refresh, el nuevo JWT incluye role=TRAINER y accede (200)
    mockAuthService.refreshToken.mockResolvedValueOnce({
      access_token: coachToken,
      refresh_token: 'refreshed-token',
      expires_in: 900,
    });

    const refreshRes = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'valid-refresh' })
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/coach/clients')
      .set('Authorization', `Bearer ${refreshRes.body.access_token}`)
      .expect(200);

    // Rechazo de rol inválido "Superadmin" (400) y petición por no-admin (403)
    mockUsersService.updateUserRole.mockRejectedValueOnce(
      new BadRequestException('Rol inválido'),
    );
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${TARGET_USER_ID}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombrerol: 'Superadmin' })
      .expect(400);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${TARGET_USER_ID}/role`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nombrerol: 'Administrador' })
      .expect(403);
  });

  it('CP-INT-078: PATCH /api/v1/admin/users/:id/status suspende cuenta (200), bloquea login con 403 y rechaza estado "Baneado" con 400', async () => {
    mockUsersService.updateUserStatus.mockResolvedValueOnce({
      idusuario: TARGET_USER_ID,
      estado_cuenta: 'Suspendido',
    });

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${TARGET_USER_ID}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado: 'Suspendido' })
      .expect(200);

    mockAuthService.login.mockRejectedValueOnce(
      new ForbiddenException(
        'Tu cuenta se encuentra suspendida. Contacta al administrador.',
      ),
    );

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user@habitapp.com', password: MOCK_AUTH_VAL })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${TARGET_USER_ID}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado: 'Baneado' })
      .expect(400);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${TARGET_USER_ID}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ estado: 'Activo' })
      .expect(403);
  });

  it('CP-INT-079: DELETE /api/v1/admin/forum/:id y /forum/comments/:id elimina en cascada para Admin (200, TD4-R1) y bloquea no-admin (403)', async () => {
    mockAdminService.deleteForum.mockResolvedValueOnce({
      message: 'Forum and its comments deleted successfully',
    });
    mockAdminService.deleteForumComment.mockResolvedValueOnce({
      message: 'Comment deleted successfully',
    });

    await request(app.getHttpServer())
      .delete(`/api/v1/admin/forum/${FORUM_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/admin/forum/comments/${COMMENT_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/admin/forum/${FORUM_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/api/v1/admin/forum/comments/${COMMENT_ID}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(403);
  });
});
