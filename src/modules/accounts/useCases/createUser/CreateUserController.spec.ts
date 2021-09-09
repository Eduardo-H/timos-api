import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new user', async () => {
    const response = await request(app).post('/users').send({
      email: 'test@example.com',
      password: '12345'
    });

    expect(response.statusCode).toBe(201);
  });

  it('should not be able to create a repeated user', async () => {
    const response = await request(app).post('/users').send({
      email: 'test@example.com',
      password: '12345'
    });

    expect(response.statusCode).toBe(400);
  });
});