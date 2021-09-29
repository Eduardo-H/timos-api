import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;

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
      name: 'John Doe',
      email: 'test@example.com',
      password: '12345'
    });

    const response = await request(app).post('/session').send({
      email: 'test@example.com',
      password: '12345'
    });

    expect(response.statusCode).toBe(200);
  });

  it('should not be able to authenticate a nonexisting user', async () => {
    const response = await request(app).post('/session').send({
      email: 'johndoe@example.com',
      password: '00000'
    });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to authenticate an user with the wrong password', async () => {
    const response = await request(app).post('/session').send({
      email: 'test@example.com',
      password: 'wrong_password'
    });

    expect(response.statusCode).toBe(400);
  });
});
