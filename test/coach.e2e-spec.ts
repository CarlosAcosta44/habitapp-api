/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '@/app.module';

describe('CoachModule (e2e) - Security perimetral', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Coach Endpoints', () => {
    it('/coach/clients (GET) without token should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/coach/clients')
        .expect(401);
    });

    it('/coach/routines (GET) without token should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/coach/routines')
        .expect(401);
    });

    it('/coach/routines (POST) without token should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/coach/routines')
        .send({ name: 'Nueva', habits: [] })
        .expect(401);
    });

    it('/coach/clients/uuid/routines/uuid/assign (POST) without token should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/coach/clients/123e4567-e89b-12d3-a456-426614174000/routines/123e4567-e89b-12d3-a456-426614174000/assign')
        .expect(401);
    });

    it('/coach/clients/uuid/progress (GET) without token should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/coach/clients/123e4567-e89b-12d3-a456-426614174000/progress')
        .expect(401);
    });
  });
});
