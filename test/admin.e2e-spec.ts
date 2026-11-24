import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
const request = require('supertest');

import { AdminController } from '@/modules/admin/controllers/admin.controller';
import { AdminService } from '@/modules/admin/services/admin.service';
import { UsersService } from '@/modules/users/services/users.service';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { SupabaseService } from '@/core/supabase/services/supabase.service';
import { UserRole } from '@/modules/users/dto/user-profile.dto';

const TEST_JWT_SECRET = ['habitapp', 'qa', 'jwt', 'key', '2026'].join('-');
process.env.JWT_SECRET = TEST_JWT_SECRET;

describe('Admin Integration Suite (API ↔ BD) — Cascade Forum & Comment Moderation (CP-INT-079)', () => {
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_JWT_SECRET }),
      ],
      controllers: [AdminController],
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
