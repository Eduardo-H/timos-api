import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;
let user_id: string;

const wrongJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUifQ.KSOCK1xgysHEraNTu4wujkrCR7hfyeNj-TaAkDF5uHo';

describe('Create Contact Request Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'test@example.com',
      password: '12345'
    });

    const tokenResponse = await request(app).post('/session').send({
      email: 'test@example.com',
      password: '12345'
    });

    token = tokenResponse.body.token;

    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'new@example.com',
      password: '12345'
    });

    const responseContact = await request(app).post('/session').send({
      email: 'new@example.com',
      password: '12345'
    });

    user_id = responseContact.body.user.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able to create a contact request', async () => {
    const response = await request(app)
      .post('/contacts/requests')
      .send({
        user_id
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.statusCode).toBe(201);
  });

  it('should not be able to create a repeated contact request', async () => {
    const response = await request(app)
      .post('/contacts/requests')
      .send({
        user_id
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to create a contact request when the users are already connected', async () => {
    await request(app)
      .post('/contacts')
      .send({
        user_id
      })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .post('/contacts/requests')
      .send({
        user_id
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to create a contact request for a nonexistent user', async () => {
    const response = await request(app)
      .post('/contacts/requests')
      .send({
        user_id: 'c4d4ff24-a5d6-4605-81bf-ba6c373a72a5'
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to create a contact request for a not logged in user', async () => {
    const response = await request(app)
      .post('/contacts/requests')
      .send({
        user_id
      })
      .set({ Authorization: `Bearer ${wrongJWT}` });

    expect(response.statusCode).toBe(401);
  });
});
