import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';

let connection: Connection;

describe('Create Contact Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/users').send({
      email: 'test@example.com',
      password: '12345'
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new contact', async () => {
    const responseToken = await request(app).post('/session').send({
      email: 'test@example.com',
      password: '12345'
    });

    const { refresh_token } = responseToken.body;

    const response = await request(app)
      .post('/contacts')
      .send({
        name: 'John Doe'
      })
      .set({
        Authorization: `Bearer ${refresh_token}`
      });

    expect(response.statusCode).toBe(201);
  });

  it('should not be able to create a repeated contact', async () => {
    const responseToken = await request(app).post('/session').send({
      email: 'test@example.com',
      password: '12345'
    });

    const { refresh_token } = responseToken.body;

    const response = await request(app)
      .post('/contacts')
      .send({
        name: 'John Doe'
      })
      .set({
        Authorization: `Bearer ${refresh_token}`
      });

    expect(response.statusCode).toBe(400);
  });
});
