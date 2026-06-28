/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '@/app.module';

describe('AdminModule (e2e) - Security perimetral', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Simulate global prefix if used in main.ts
    // (Optional, assume API prefix isn't set or applies manually)
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Management', () => {
    it('/users (GET) without token should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/users') // The endpoint from Admin module (users controller)
        .expect(401);
    });
  });

  describe('Moderation', () => {
    it('/admin/forum/threads/uuid (DELETE) without token should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .delete('/admin/forum/threads/123e4567-e89b-12d3-a456-426614174000')
        .expect(401);
    });
    
    it('/admin/forum/comments/uuid (DELETE) without token should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .delete('/admin/forum/comments/123e4567-e89b-12d3-a456-426614174000')
        .expect(401);
    });
  });
});
