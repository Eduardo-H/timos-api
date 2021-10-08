import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;
let user_id: string;

const wrongJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUifQ.KSOCK1xgysHEraNTu4wujkrCR7hfyeNj-TaAkDF5uHo';

describe('Refuse Contact Request Controller', () => {
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

  it('should be able to refuse a contact request', async () => {
    const contactRequestResponse = await request(app)
      .post('/contacts/requests')
      .send({
        user_id
      })
      .set({ Authorization: `Bearer ${token}` });

    const { id } = contactRequestResponse.body;

    const response = await request(app)
      .delete(`/contacts/requests/${id}/refuse`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.statusCode).toBe(200);
  });

  it('should not be able to refuse a nonexistent contact request', async () => {
    const response = await request(app)
      .delete(`/contacts/requests/c4d4ff24-a5d6-4605-81bf-ba6c373a72a5/refuse`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.statusCode).toBe(400);
  });

  it('should not allow an user that is not a part of the contact request to refuse it', async () => {
    const contactRequestResponse = await request(app)
      .post('/contacts/requests')
      .send({
        user_id
      })
      .set({ Authorization: `Bearer ${token}` });

    const { id } = contactRequestResponse.body;

    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    const tokenResponse = await request(app).post('/session').send({
      email: 'johndoe@example.com',
      password: '12345'
    });

    const newUserToken = tokenResponse.body.token;

    const response = await request(app)
      .delete(`/contacts/requests/${id}/refuse`)
      .set({ Authorization: `Bearer ${newUserToken}` });

    expect(response.statusCode).toBe(401);
  });

  it('should not be able to refuse a contact request if the user is not logged in', async () => {
    const contactRequestResponse = await request(app)
      .post('/contacts/requests')
      .send({
        user_id
      })
      .set({ Authorization: `Bearer ${token}` });

    const { id } = contactRequestResponse.body;

    const response = await request(app)
      .delete(`/contacts/requests/${id}/refuse`)
      .set({ Authorization: `Bearer ${wrongJWT}` });

    expect(response.statusCode).toBe(401);
  });
});
