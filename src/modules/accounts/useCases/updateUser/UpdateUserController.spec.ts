import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;

const wrongJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUifQ.KSOCK1xgysHEraNTu4wujkrCR7hfyeNj-TaAkDF5uHo';

describe('Update User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'test@example.com',
      password: '12345'
    });

    const tokenResponse = await request(app)
      .post('/session')
      .send({ email: 'test@example.com', password: '12345' });

    token = tokenResponse.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able to update an user', async () => {
    const response = await request(app)
      .put('/me')
      .send({
        name: 'Marry Louise'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(201);
  });

  it('should not be able to update a nonexistent user', async () => {
    const response = await request(app)
      .put('/me')
      .send({
        name: 'Marry Louise'
      })
      .set({
        Authorization: `Bearer ${wrongJWT}`
      });

    expect(response.statusCode).toBe(401);
  });
});
