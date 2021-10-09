import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;
let contact_id: string;

describe('Delete Loan Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    // Creating a new user
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

    // Creating another user
    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'new@example.com',
      password: '12345'
    });

    const contactResponse = await request(app).post('/session').send({
      email: 'new@example.com',
      password: '12345'
    });

    contact_id = contactResponse.body.user.id;
    const contact_token = contactResponse.body.token;

    // Creatin the connection between the two users
    const contactRequestResponse = await request(app)
      .post('/contacts/requests')
      .send({
        user_id: contact_id
      })
      .set({ Authorization: `Bearer ${token}` });

    const request_id = contactRequestResponse.body.id;

    await request(app)
      .post(`/contacts/requests/${request_id}/accept`)
      .set({
        Authorization: `Bearer ${contact_token}`
      });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able to delete a loan', async () => {
    // Creating a new loan
    const loanResponse = await request(app)
      .post('/loans')
      .send({
        contact_id,
        value: 50,
        type: 'pagar',
        limit_date: new Date('2030-06-01')
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const { id } = loanResponse.body;

    const response = await request(app)
      .delete('/loans')
      .send({ id })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.statusCode).toBe(200);
  });

  it('should not be able to delete a nonexistent loan', async () => {
    const response = await request(app)
      .delete('/loans')
      .send({ id: '868272c3-c308-44e8-9a53-e0ccf61e9639' })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to delete a loan of another user', async () => {
    // Creating a new loan
    const loanResponse = await request(app)
      .post('/loans')
      .send({
        contact_id,
        value: 50,
        type: 'pagar',
        limit_date: new Date('2030-06-01')
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const { id } = loanResponse.body;

    // Creating a new user and fetching refresh token
    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    const tokenResponse = await request(app).post('/session').send({
      email: 'johndoe@example.com',
      password: '12345'
    });

    const { refresh_token } = tokenResponse.body;

    const response = await request(app)
      .delete('/loans')
      .send({ id })
      .set({ Authorization: `Bearer ${refresh_token}` });

    expect(response.statusCode).toBe(401);
  });
});
