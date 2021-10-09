import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;
let contact_id: string;
let contact_token: string;

describe('Accept Contact Request Controller', () => {
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
    contact_token = responseContact.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able to accept a contact request', async () => {
    const contactRequestResponse = await request(app)
      .post('/contacts/requests')
      .send({
        user_id: contact_id
      })
      .set({ Authorization: `Bearer ${token}` });

    const { id } = contactRequestResponse.body;

    const response = await request(app)
      .post(`/contacts/requests/${id}/accept`)
      .set({
        Authorization: `Bearer ${contact_token}`
      });

    expect(response.statusCode).toBe(201);
  });

  it('should not allow requester to accept a contact request', async () => {
    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    const responseContact = await request(app).post('/session').send({
      email: 'johndoe@example.com',
      password: '12345'
    });

    const newUserId = responseContact.body.user.id;

    const contactRequestResponse = await request(app)
      .post('/contacts/requests')
      .send({
        user_id: newUserId
      })
      .set({ Authorization: `Bearer ${token}` });

    const { id } = contactRequestResponse.body;

    const response = await request(app)
      .post(`/contacts/requests/${id}/accept`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(401);
  });
});
