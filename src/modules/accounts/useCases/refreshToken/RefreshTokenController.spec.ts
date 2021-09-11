import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;

const wrongJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUifQ.KSOCK1xgysHEraNTu4wujkrCR7hfyeNj-TaAkDF5uHo';

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able to authenticate an user', async () => {
    await request(app).post('/users').send({
      email: 'test@example.com',
      password: '12345'
    });

    const responseToken = await request(app).post('/session').send({
      email: 'test@example.com',
      password: '12345'
    });

    const { refresh_token } = responseToken.body;

    const response = await request(app).post('/refresh-token').set({
      'x-access-token': refresh_token
    });

    expect(response.statusCode).toBe(200);
  });

  it('should not be able to generate a new token when using a wrong refresh token', async () => {
    const response = await request(app).post('/refresh-token').set({
      'x-access-token': wrongJWT
    });

    expect(response.statusCode).toBe(500);
  });
});
