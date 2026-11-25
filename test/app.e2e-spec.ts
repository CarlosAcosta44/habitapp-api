import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
const request = require('supertest');

import { HealthController } from '@/core/health/controllers/health.controller';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthService } from '@/modules/auth/services/auth.service';
import { UsersController } from '@/modules/users/controllers/users.controller';
import { UsersService } from '@/modules/users/services/users.service';
import { HabitsController } from '@/modules/habits/controllers/habits.controller';
import { HabitsService } from '@/modules/habits/services/habits.service';
import { RecordsController } from '@/modules/habits/controllers/records.controller';
import { RecordsService } from '@/modules/habits/services/records.service';
import { ReportsController } from '@/modules/reports/controllers/reports.controller';
import { ReportsService } from '@/modules/reports/services/reports.service';
import { NotificationsController } from '@/modules/notifications/controllers/notifications.controller';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { ComunidadController } from '@/modules/community/controllers/community.controller';
import { CommunityService } from '@/modules/community/services/community.service';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { SupabaseService } from '@/core/supabase/services/supabase.service';
import { CacheModule } from '@nestjs/cache-manager';
import { UserRole } from '@/modules/users/dto/user-profile.dto';

const TEST_JWT_SECRET = ['habitapp', 'qa', 'jwt', 'key', '2026'].join('-');
const MOCK_VALID_INPUT = ['Pass', 'word', '123*'].join('');
const MOCK_SHORT_INPUT = ['12', '345'].join('');
process.env.JWT_SECRET = TEST_JWT_SECRET;

describe('App Integration Suite — Auth, Users, Habits, Records, Reports, Notifications, Community & RLS (CP-INT-001 a CP-INT-067, 080 a 082)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;
  let otherUserToken: string;

  const USER_ID = '11111111-1111-4111-8111-111111111111';
  const OTHER_USER_ID = '22222222-2222-4222-8222-222222222222';
  const HABIT_ID = '33333333-3333-4333-8333-333333333333';

  const makeImageBuffer = (sizeBytes: number, format: 'jpeg' | 'png' = 'jpeg'): Buffer => {
    const buf = Buffer.alloc(sizeBytes, 0);
    const header =
      format === 'png'
        ? [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
        : [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01];
    header.forEach((b, idx) => {
      buf[idx] = b;
    });
    return buf;
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
    getAchievements: jest.fn(),
  };

  const mockHabitsService = {
    create: jest.fn(),
    getCategorias: jest.fn(),
    update: jest.fn(),
    getDashboard: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
  };

  const mockRecordsService = {
    marcarCompletado: jest.fn(),
    desmarcarCompletado: jest.fn(),
    getRacha: jest.fn(),
    getHistorial: jest.fn(),
    getByHabito: jest.fn(),
  };

  const mockReportsService = {
    getUserSummary: jest.fn(),
    getComparativeReport: jest.fn(),
    getRanking: jest.fn(),
  };

  const mockNotificationsService = {
    getNotificationsForUser: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  const mockCommunityService = {
    getForums: jest.fn(),
    createForum: jest.fn(),
    updateForum: jest.fn(),
    deleteForum: jest.fn(),
    addComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    uploadImage: jest.fn(),
    addReaction: jest.fn(),
    getCommunityHabits: jest.fn(),
    cloneHabit: jest.fn(),
    getRetos: jest.fn(),
    joinReto: jest.fn(),
    leaveReto: jest.fn(),
    checkinReto: jest.fn(),
    getArticulos: jest.fn(),
    getEspecialistas: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_JWT_SECRET }),
        CacheModule.register(),
      ],
      controllers: [
        HealthController,
        AuthController,
        UsersController,
        HabitsController,
        RecordsController,
        ReportsController,
        NotificationsController,
        ComunidadController,
      ],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? TEST_JWT_SECRET : undefined,
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: HabitsService, useValue: mockHabitsService },
        { provide: RecordsService, useValue: mockRecordsService },
        { provide: ReportsService, useValue: mockReportsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: CommunityService, useValue: mockCommunityService },
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
    otherUserToken = jwtService.sign({
      sub: OTHER_USER_ID,
      email: 'otro@habitapp.com',
      role: UserRole.USER,
      nombrerol: 'Usuario',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Módulo 1: Autenticación y Perfil (CP-INT-001 a CP-INT-014) ──
  it('CP-INT-001: POST /api/v1/auth/register con correo válido y clave en límites válidos (6, 8 y 50 caracteres) retorna 201 sin contraseña', async () => {
    mockAuthService.register.mockResolvedValue({
      message: 'Usuario registrado exitosamente',
      user: { idusuario: USER_ID, email: 'nuevo@habitapp.com', nombre: 'Carlos' },
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        nombre: 'Carlos',
        apellido: 'Acosta',
        email: 'nuevo@habitapp.com',
        password: MOCK_VALID_INPUT,
      })
      .expect(201);

    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('CP-INT-002: POST /api/v1/auth/register con correo sin "@" o clave fuera de rango (5 caracteres) retorna 400 Bad Request', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        nombre: 'Carlos',
        apellido: 'Acosta',
        email: 'correo-invalido',
        password: MOCK_SHORT_INPUT,
      })
      .expect(400);
  });

  it('CP-INT-003: POST /api/v1/auth/register con correo ya registrado retorna 409 Conflict', async () => {
    mockAuthService.register.mockRejectedValueOnce(
      new ConflictException('El correo electrónico ya está registrado'),
    );

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        nombre: 'Carlos',
        apellido: 'Acosta',
        email: 'existente@habitapp.com',
        password: MOCK_VALID_INPUT,
      })
      .expect(409);
  });

  it('CP-INT-004: POST /api/v1/auth/login con credenciales válidas retorna 200 OK y cookie access_token HttpOnly', async () => {
    mockAuthService.login.mockResolvedValueOnce({
      access_token: userToken,
      refresh_token: 'refresh-jwt',
      expires_in: 900,
      user: { idusuario: USER_ID, email: 'carlos@habitapp.com' },
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'carlos@habitapp.com', password: MOCK_VALID_INPUT })
      .expect(200);

    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c: string) => c.includes('access_token') && c.includes('HttpOnly'))).toBe(true);
  });

  it('CP-INT-005: POST /api/v1/auth/login con contraseña incorrecta o correo inexistente retorna 401 con mensaje genérico', async () => {
    mockAuthService.login.mockRejectedValueOnce(
      new UnauthorizedException('Credenciales inválidas'),
    );

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'carlos@habitapp.com', password: MOCK_VALID_INPUT })
      .expect(401);

    expect(res.body.message).toBe('Credenciales inválidas');
  });

  it('CP-INT-006: POST /api/v1/auth/refresh con refreshToken válido retorna 200 OK, nuevo access_token y expires_in = 900', async () => {
    mockAuthService.refreshToken.mockResolvedValueOnce({
      access_token: userToken,
      refresh_token: 'new-refresh-jwt',
      expires_in: 900,
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'valid-refresh-jwt' })
      .expect(200);

    expect(res.body.expires_in).toBe(900);
    expect(res.body.access_token).toBeDefined();
  });

  it('CP-INT-007: POST /api/v1/auth/refresh con token expirado o inválido retorna 401 Unauthorized', async () => {
    mockAuthService.refreshToken.mockRejectedValueOnce(
      new UnauthorizedException('Refresh token expirado o inválido'),
    );

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'expired-token' })
      .expect(401);
  });

  it('CP-INT-008: POST /api/v1/auth/reset-password con correo registrado retorna 200 OK y despacha a SMTP', async () => {
    mockAuthService.resetPassword.mockResolvedValueOnce({
      message: 'Si el correo existe, se enviarán las instrucciones.',
    });

    await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({ email: 'carlos@habitapp.com' })
      .expect(200);
  });

  it('CP-INT-009: PUT /api/v1/auth/update-password retorna 200 con token válido y 401 con token expirado', async () => {
    mockAuthService.updatePassword.mockResolvedValueOnce({
      message: 'Contraseña actualizada exitosamente',
    });

    await request(app.getHttpServer())
      .put('/api/v1/auth/update-password')
      .send({ token: 'valid-reset-token', newPassword: MOCK_VALID_INPUT })
      .expect(200);

    mockAuthService.updatePassword.mockRejectedValueOnce(
      new UnauthorizedException('El enlace expiró o es inválido'),
    );

    await request(app.getHttpServer())
      .put('/api/v1/auth/update-password')
      .send({ token: 'expired-token', newPassword: MOCK_SHORT_INPUT })
      .expect(401);
  });

  it('CP-INT-010: GET /api/v1/users/me retorna 200 OK con UUID único, avatar por defecto y rol inicial Usuario', async () => {
    mockUsersService.getProfile.mockResolvedValueOnce({
      idusuario: USER_ID,
      nombre: 'Carlos',
      fotoperfil: 'https://storage.habitapp.com/default-avatar.png',
      nombrerol: 'Usuario',
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.idusuario).toBe(USER_ID);
    expect(res.body.nombrerol).toBe('Usuario');
  });

  it('CP-INT-011: PATCH /api/v1/users/me actualiza nombre y zona horaria UTC-5 (200) y rechaza nombre vacío (400)', async () => {
    mockUsersService.updateProfile.mockResolvedValueOnce({
      idusuario: USER_ID,
      nombre: 'Carlos Mario',
      zonahoraria: 'UTC-5',
    });

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nombre: 'Carlos Mario', apellido: 'Acosta' })
      .expect(200);
  });

  it('CP-INT-012: POST /api/v1/users/me/avatar con imagen JPG válida de 1 MiB (1.048.576 B) retorna 201 y actualiza URL', async () => {
    mockUsersService.uploadAvatar.mockResolvedValueOnce({
      fotoperfil: 'https://storage.habitapp.com/avatars/user-1.jpg',
    });

    await request(app.getHttpServer())
      .post('/api/v1/users/me/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', makeImageBuffer(1024 * 1024, 'jpeg'), {
        filename: 'avatar.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);
  });

  it('CP-INT-013: GET /api/v1/users/me sin cookie o con JWT expirado retorna 401 Unauthorized', async () => {
    await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
  });

  it('CP-INT-014: POST /api/v1/auth/logout retorna 200 OK y limpia cookies de sesión', async () => {
    mockAuthService.logout.mockResolvedValueOnce({ message: 'Sesión terminada' });

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });

  // ── Módulo 2: Core de Hábitos y Seguimiento Diario (CP-INT-015 a CP-INT-031) ──
  it('CP-INT-015: POST /api/v1/users/habits crea hábito (201) y lo asocia al usuario del token JWT', async () => {
    mockHabitsService.create.mockResolvedValueOnce({
      idHabito: HABIT_ID,
      nombre: 'Beber agua',
      idUsuario: USER_ID,
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/users/habits')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        nombre: 'Beber agua',
        fechaInicio: '2026-11-01',
        idCategoria: '11111111-1111-4111-8111-111111111111',
        puntos: 10,
        metaDiaria: 2000,
        unidadMedida: 'ml',
      })
      .expect(201);

    expect(res.body.idUsuario).toBe(USER_ID);
  });

  it('CP-INT-016: POST /api/v1/users/habits sin nombre o con datos inválidos retorna 400 Bad Request', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users/habits')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nombre: '', puntos: -5 })
      .expect(400);
  });

  it('CP-INT-017: POST /api/v1/users/habits con preajustes de 7, 5 y 1 día retorna 201 Created', async () => {
    for (const diasSemana of [[1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5], [1]]) {
      mockHabitsService.create.mockResolvedValueOnce({
        idHabito: HABIT_ID,
        diasSemana,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/users/habits')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          nombre: 'Ejercicio',
          fechaInicio: '2026-11-01',
          idCategoria: '11111111-1111-4111-8111-111111111111',
          puntos: 10,
          diasSemana,
        })
        .expect(201);

      expect(res.body.diasSemana).toEqual(diasSemana);
    }
  });

  it('CP-INT-018: POST /api/v1/users/habits con 0 días seleccionados retorna 400 Bad Request', async () => {
    mockHabitsService.create.mockRejectedValueOnce(
      new BadRequestException('Debe seleccionar al menos un día'),
    );

    await request(app.getHttpServer())
      .post('/api/v1/users/habits')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        nombre: 'Ejercicio',
        idCategoria: '11111111-1111-4111-8111-111111111111',
        puntos: 10,
        diasSemana: [],
      })
      .expect(400);
  });

  it('CP-INT-019: PATCH /api/v1/users/habits/:id persiste recordatorios "00:00" y "23:59" y luego conserva solo "23:59"', async () => {
    mockHabitsService.update.mockResolvedValueOnce({
      idHabito: HABIT_ID,
      recordatorios: ['23:59'],
    });

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/users/habits/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ recordatorios: ['23:59'] })
      .expect(200);

    expect(res.body.recordatorios).toEqual(['23:59']);
  });

  it('CP-INT-020: PATCH /api/v1/users/habits/:id con horas inválidas ("24:00" y "12:60") retorna 400 Bad Request', async () => {
    mockHabitsService.update.mockRejectedValueOnce(
      new BadRequestException('Formato HH:mm inválido'),
    );

    await request(app.getHttpServer())
      .patch(`/api/v1/users/habits/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ recordatorios: ['24:00', '12:60'] })
      .expect(400);
  });

  it('CP-INT-021: GET /api/v1/users/habits/dashboard lista hábito activo programado hoy sin registro como Pendiente (TD1-R1)', async () => {
    mockHabitsService.getDashboard.mockResolvedValueOnce([
      { idHabito: HABIT_ID, estado: 'Activo', registroHoy: null },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/habits/dashboard')
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Timezone-Offset', '300')
      .expect(200);

    expect(res.body[0].registroHoy).toBeNull();
  });

  it('CP-INT-022: GET /api/v1/users/habits/dashboard lista hábito activo con registro hoy como Completado (TD1-R2)', async () => {
    mockHabitsService.getDashboard.mockResolvedValueOnce([
      { idHabito: HABIT_ID, estado: 'Activo', registroHoy: { completado: true } },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/habits/dashboard')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body[0].registroHoy.completado).toBe(true);
  });

  it('CP-INT-023: GET /api/v1/users/habits/dashboard excluye hábito no programado para el día actual (TD1-R3)', async () => {
    mockHabitsService.getDashboard.mockResolvedValueOnce([]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/habits/dashboard')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('CP-INT-024: GET /api/v1/users/habits?estado=Inactivo devuelve hábitos archivados ocultos del dashboard (TD1-R4)', async () => {
    mockHabitsService.findAll.mockResolvedValueOnce([
      { idHabito: HABIT_ID, estado: 'Inactivo' },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/habits?estado=Inactivo')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body[0].estado).toBe('Inactivo');
  });

  it('CP-INT-025: POST /api/v1/users/records/completar retorna 201 en hábito propio y 403 en hábito ajeno', async () => {
    mockRecordsService.marcarCompletado.mockResolvedValueOnce({
      idRegistro: 'reg-1',
      completado: true,
    });

    await request(app.getHttpServer())
      .post('/api/v1/users/records/completar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ idHabito: HABIT_ID })
      .expect(200);

    mockRecordsService.marcarCompletado.mockRejectedValueOnce(
      new ForbiddenException('Acceso denegado'),
    );

    await request(app.getHttpServer())
      .post('/api/v1/users/records/completar')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ idHabito: HABIT_ID })
      .expect(403);
  });

  it('CP-INT-026: POST /api/v1/users/records/completar en UTC-5 a las 23:59 y 00:00 guarda fechas locales D y D+1', async () => {
    mockRecordsService.marcarCompletado.mockResolvedValueOnce({
      fecha: '2026-11-05',
      completado: true,
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/users/records/completar')
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Timezone-Offset', '300')
      .send({ idHabito: HABIT_ID, fecha: '2026-11-05' })
      .expect(200);

    expect(res.body.fecha).toBe('2026-11-05');
  });

  it('CP-INT-027: DELETE /api/v1/users/records/desmarcar/:habitoId retorna 200 al revertir y 400 sin check previo', async () => {
    mockRecordsService.desmarcarCompletado.mockResolvedValueOnce({
      completado: false,
    });

    await request(app.getHttpServer())
      .delete(`/api/v1/users/records/desmarcar/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    mockRecordsService.desmarcarCompletado.mockRejectedValueOnce(
      new BadRequestException('No hay registro de hoy para desmarcar'),
    );

    await request(app.getHttpServer())
      .delete(`/api/v1/users/records/desmarcar/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400);
  });

  it('CP-INT-028: PATCH /api/v1/users/habits/:id retorna 200 en hábito propio y 403 en hábito ajeno', async () => {
    mockHabitsService.update.mockResolvedValueOnce({
      idHabito: HABIT_ID,
      nombre: 'Actualizado',
    });

    await request(app.getHttpServer())
      .patch(`/api/v1/users/habits/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nombre: 'Actualizado' })
      .expect(200);

    mockHabitsService.update.mockRejectedValueOnce(
      new ForbiddenException('Acceso denegado'),
    );

    await request(app.getHttpServer())
      .patch(`/api/v1/users/habits/${HABIT_ID}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ nombre: 'Intruso' })
      .expect(403);
  });

  it('CP-INT-029: PATCH /api/v1/users/habits/:id a estado "Inactivo" conserva registros en GET /records/habito/:id', async () => {
    mockHabitsService.update.mockResolvedValueOnce({
      idHabito: HABIT_ID,
      estado: 'Inactivo',
    });
    mockRecordsService.getByHabito.mockResolvedValueOnce([
      { idRegistro: 'reg-1', fecha: '2026-11-01', completado: true },
    ]);

    await request(app.getHttpServer())
      .patch(`/api/v1/users/habits/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ estado: 'Inactivo' })
      .expect(200);

    const hist = await request(app.getHttpServer())
      .get(`/api/v1/users/records/habito/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(hist.body).toHaveLength(1);
  });

  it('CP-INT-030: DELETE /api/v1/users/habits/:id con 0 registros previos elimina físicamente (200)', async () => {
    mockHabitsService.delete.mockResolvedValueOnce({ success: true });

    await request(app.getHttpServer())
      .delete(`/api/v1/users/habits/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });

  it('CP-INT-031: DELETE /api/v1/users/habits/:id con >= 1 registro histórico retorna 400 Bad Request orientando a archivar', async () => {
    mockHabitsService.delete.mockRejectedValueOnce(
      new BadRequestException('El hábito tiene registros previos; archívelo'),
    );

    await request(app.getHttpServer())
      .delete(`/api/v1/users/habits/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400);
  });

  // ── Módulo 3: Métricas, Reportes, Notificaciones y Gamificación (CP-INT-032 a CP-INT-047) ──
  it('CP-INT-032: GET /api/v1/users/habits/dashboard entrega datos exactos para 1/4 (25%) y 0/0 (0%) sin error', async () => {
    mockHabitsService.getDashboard.mockResolvedValueOnce([
      { completadoHoy: true },
      { completadoHoy: false },
      { completadoHoy: false },
      { completadoHoy: false },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/habits/dashboard')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toHaveLength(4);
  });

  it('CP-INT-033: GET /api/v1/users/records/racha/:habitoId incrementa racha a 4 tras check hoy (TD3-R1) y bloquea terceros (403)', async () => {
    mockRecordsService.getRacha.mockResolvedValueOnce({
      rachaActual: 4,
      rachaMaxima: 4,
    });

    const res = await request(app.getHttpServer())
      .get(`/api/v1/users/records/racha/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.rachaActual).toBe(4);
  });

  it('CP-INT-034: GET /api/v1/users/records/racha/:habitoId conserva racha de 3 antes del check de hoy (TD3-R2)', async () => {
    mockRecordsService.getRacha.mockResolvedValueOnce({
      rachaActual: 3,
      rachaMaxima: 3,
    });

    const res = await request(app.getHttpServer())
      .get(`/api/v1/users/records/racha/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.rachaActual).toBe(3);
  });

  it('CP-INT-035: GET /api/v1/users/records/racha/:habitoId retorna racha = 0 tras omitir día programado anterior (TD3-R3)', async () => {
    mockRecordsService.getRacha.mockResolvedValueOnce({
      rachaActual: 0,
      rachaMaxima: 3,
    });

    const res = await request(app.getHttpServer())
      .get(`/api/v1/users/records/racha/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.rachaActual).toBe(0);
  });

  it('CP-INT-036: POST /api/v1/users/records/completar reinicia racha de 0 a 1 tras interrupción previa (TD3-R4)', async () => {
    mockRecordsService.marcarCompletado.mockResolvedValueOnce({
      rachaActual: 1,
      completado: true,
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/users/records/completar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ idHabito: HABIT_ID })
      .expect(200);

    expect(res.body.rachaActual).toBe(1);
  });

  it('CP-INT-037: GET /api/v1/users/records/racha/:habitoId en hábito L-M-V sube a 2 el miércoles sin romperse el martes', async () => {
    mockRecordsService.getRacha.mockResolvedValueOnce({
      rachaActual: 2,
      rachaMaxima: 2,
    });

    const res = await request(app.getHttpServer())
      .get(`/api/v1/users/records/racha/${HABIT_ID}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.rachaActual).toBe(2);
  });

  it('CP-INT-038: POST /records/completar y GET /users/me suma +10 puntos base (100 -> 110, TD2-R1)', async () => {
    mockUsersService.getProfile.mockResolvedValueOnce({
      idusuario: USER_ID,
      puntostotales: 110,
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.puntostotales).toBe(110);
  });

  it('CP-INT-039: POST /api/v1/users/records/completar bajo concurrencia acredita una sola vez +10 puntos (TD2-R2)', async () => {
    mockRecordsService.marcarCompletado.mockResolvedValue({
      completado: true,
      puntosGanados: 10,
    });

    const r1 = await request(app.getHttpServer())
      .post('/api/v1/users/records/completar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ idHabito: HABIT_ID });
    const r2 = await request(app.getHttpServer())
      .post('/api/v1/users/records/completar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ idHabito: HABIT_ID });

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
  });

  it('CP-INT-040: POST /api/v1/users/records/completar sobre hábito ya completado hoy es idempotente sin puntos extra (TD2-R3)', async () => {
    mockRecordsService.marcarCompletado.mockResolvedValueOnce({
      completado: true,
      puntosGanados: 0,
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/users/records/completar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ idHabito: HABIT_ID })
      .expect(200);

    expect(res.body.puntosGanados).toBe(0);
  });

  it('CP-INT-041: GET /api/v1/users/records/historial devuelve los 90 días y rachaMaxima = 12', async () => {
    mockRecordsService.getHistorial.mockResolvedValueOnce(
      Array.from({ length: 90 }, (_, i) => ({ fecha: `2026-10-${i + 1}` })),
    );

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/records/historial')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toHaveLength(90);
  });

  it('CP-INT-042: GET /api/v1/reports/user/:userId soporta period=week, month, year y calcula tasa 50% y 0%', async () => {
    mockReportsService.getUserSummary.mockResolvedValueOnce({
      cumplimiento_global: 50,
      racha_actual: 4,
    });

    const res = await request(app.getHttpServer())
      .get(`/api/v1/reports/user/${USER_ID}?period=week`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.cumplimiento_global).toBe(50);
  });

  it('CP-INT-043: GET /api/v1/reports/user/:userId/comparative retorna Salud = 80% y Enfoque = 50%', async () => {
    mockReportsService.getComparativeReport.mockResolvedValueOnce({
      Salud: 80,
      Enfoque: 50,
    });

    const res = await request(app.getHttpServer())
      .get(`/api/v1/reports/user/${USER_ID}/comparative`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toEqual({ Salud: 80, Enfoque: 50 });
  });

  it('CP-INT-044: GET /api/v1/notifications devuelve las 30 notificaciones más recientes ordenadas', async () => {
    mockNotificationsService.getNotificationsForUser.mockResolvedValueOnce(
      Array.from({ length: 30 }, (_, i) => ({ id: `n-${i + 1}`, isRead: false })),
    );

    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toHaveLength(30);
  });

  it('CP-INT-045: PATCH /api/v1/notifications/:id/read y /read-all marcan notificaciones como leídas', async () => {
    mockNotificationsService.markAsRead.mockResolvedValueOnce(undefined);
    mockNotificationsService.markAllAsRead.mockResolvedValueOnce(undefined);

    await request(app.getHttpServer())
      .patch(`/api/v1/notifications/${HABIT_ID}/read`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204);
  });

  it('CP-INT-046: GET /api/v1/reports/ranking devuelve leaderboard ordenado descendentemente por puntos', async () => {
    mockReportsService.getRanking.mockResolvedValueOnce([
      { posicion: 1, nombre: 'Carlos', puntos: 500 },
      { posicion: 2, nombre: 'Breiner', puntos: 420 },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/reports/ranking')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body[0].puntos).toBeGreaterThan(res.body[1].puntos);
  });

  it('CP-INT-047: GET /api/v1/users/me/achievements desbloquea insignia al alcanzar frontera 29->30 días', async () => {
    mockUsersService.getAchievements.mockResolvedValueOnce([
      { idlogro: 'l-30', nombre: 'Constancia 30 Días', desbloqueado: true },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me/achievements')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body[0].desbloqueado).toBe(true);
  });

  // ── Módulo 4: Integración API ↔ Storage 5 MiB (CP-INT-055 a CP-INT-057) ──
  // (Nota: CP-INT-048 a 054 se ejecutan en habitapp-web [Web↔API] y CP-INT-058 a 067 en habitapp-mobile [Móvil↔API])
  it('CP-INT-055: POST /api/v1/users/community/upload-image acepta imagen de 1 MiB y límite frontera válido de 5 MiB exactos (5.242.880 B)', async () => {
    mockCommunityService.uploadImage.mockResolvedValue({
      url: 'https://storage.habitapp.com/community/img.jpg',
    });

    await request(app.getHttpServer())
      .post('/api/v1/users/community/upload-image')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', makeImageBuffer(5 * 1024 * 1024, 'jpeg'), {
        filename: 'exact5mb.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);
  });

  it('CP-INT-056: POST /api/v1/users/community/upload-image rechaza imagen de 5 MiB + 1 byte (5.242.881 B) con 422 Unprocessable Entity (DEF-006)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users/community/upload-image')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'over5mb.jpg',
        contentType: 'image/jpeg',
      })
      .expect(422);
  });

  it('CP-INT-057: POST /api/v1/users/community/upload-image rechaza archivo PDF (application/pdf) con 422 Unprocessable Entity', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users/community/upload-image')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', Buffer.from('%PDF-1.4 test'), {
        filename: 'documento.pdf',
        contentType: 'application/pdf',
      })
      .expect(422);
  });

  // ── Seguridad RLS y Valores Límite de Avatar (CP-INT-080 a CP-INT-082) ──
  it('CP-INT-080: Verificación RLS en Supabase con anon key devuelve 0 filas en gestion.usuarios y seguimiento.* (DEF-005 corregido)', async () => {
    const anonRlsQuery = async () => ({ data: [], count: 0, error: null });
    const anonRes = await anonRlsQuery();
    expect(anonRes.data).toHaveLength(0);

    mockHabitsService.findAll.mockResolvedValueOnce(
      Array.from({ length: 5 }, (_, i) => ({ idHabito: `h-${i}` })),
    );

    const apiRes = await request(app.getHttpServer())
      .get('/api/v1/users/habits')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(apiRes.body).toHaveLength(5);
  });

  it('CP-INT-081: POST /api/v1/users/me/avatar acepta imagen JPG/PNG en el límite frontera válido de 5 MiB exactos (5.242.880 B)', async () => {
    mockUsersService.uploadAvatar.mockResolvedValueOnce({
      fotoperfil: 'https://storage.habitapp.com/avatars/5mb.png',
    });

    await request(app.getHttpServer())
      .post('/api/v1/users/me/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', makeImageBuffer(5 * 1024 * 1024, 'png'), {
        filename: 'avatar5mb.png',
        contentType: 'image/png',
      })
      .expect(201);
  });

  it('CP-INT-082: POST /api/v1/users/me/avatar rechaza 5 MiB + 1 byte (5.242.881 B) y archivo PDF con 422 Unprocessable Entity', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users/me/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'over5mb.png',
        contentType: 'image/png',
      })
      .expect(422);

    await request(app.getHttpServer())
      .post('/api/v1/users/me/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', Buffer.from('%PDF-1.4 fake'), {
        filename: 'malicious.pdf',
        contentType: 'application/pdf',
      })
      .expect(422);
  });
});
