import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;
let contact_token: string;
let payment_id: string;

describe('Approve Payment Controller', () => {
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

    const contact_id = contactResponse.body.user.id;
    contact_token = contactResponse.body.token;

    // Creatin the connection between the two users
    await request(app)
      .post('/contacts')
      .send({
        contact_id
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    // Creating a new loan between the two users
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

    // Creating a new payment for the loan
    const paymentResponse = await request(app)
      .post('/loans/payment')
      .send({
        loan_id: loanResponse.body.id,
        value: 25
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    payment_id = paymentResponse.body.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able to approve a payement', async () => {
    const response = await request(app)
      .patch(`/loans/payment/${payment_id}/approve`)
      .set({
        Authorization: `Bearer ${contact_token}`
      });

    expect(response.statusCode).toBe(201);
  });

  it('should not be able to approve a nonexistent payment', async () => {
    const response = await request(app)
      .patch('/loans/payment/868272c3-c308-44e8-9a53-e0ccf61e9639/approve')
      .set({
        Authorization: `Bearer ${contact_token}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not allow the payer to approve a payment', async () => {
    const response = await request(app)
      .patch(`/loans/payment/${payment_id}/approve`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(401);
  });
});
