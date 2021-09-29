import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;
let contact_id: string;

describe('Create Contact Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'test@example.com',
      password: '12345'
    });

    const responseToken = await request(app).post('/session').send({
      email: 'test@example.com',
      password: '12345'
    });

    token = responseToken.body.token;

    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'new@example.com',
      password: '12345'
    });

    const responseContact = await request(app).post('/session').send({
      email: 'new@example.com',
      password: '12345'
    });

    contact_id = responseContact.body.user.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able to create a new contact', async () => {
    const response = await request(app)
      .post('/contacts')
      .send({
        contact_id
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(201);
  });

  it('should not be able to create a repeated contact', async () => {
    const response = await request(app)
      .post('/contacts')
      .send({
        contact_id
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(400);
  });
});
