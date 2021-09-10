import { LoanType } from '@modules/loans/infra/typeorm/entities/Loan';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';

let connection: Connection;
let refreshToken: string;
let contact_id: string;

describe('Delete Loan Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    // Creating a new user and fetching refresh token
    await request(app).post('/users').send({
      email: 'test@example.com',
      password: '12345'
    });

    const tokenResponse = await request(app).post('/session').send({
      email: 'test@example.com',
      password: '12345'
    });

    refreshToken = tokenResponse.body.refresh_token;

    // Creating a new contact
    const contactResponse = await request(app)
      .post('/contacts')
      .send({
        name: 'John Doe'
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    contact_id = contactResponse.body.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to delete a loan', async () => {
    // Creating a new loan
    const loanResponse = await request(app)
      .post('/loans')
      .send({
        contact_id,
        value: 50,
        type: LoanType.PAY,
        limit_date: new Date('2030-06-01')
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    const { id } = loanResponse.body;

    const response = await request(app)
      .delete('/loans')
      .send({ id })
      .set({ Authorization: `Bearer ${refreshToken}` });

    expect(response.statusCode).toBe(200);
  });

  it('should not be able to delete a nonexistent loan', async () => {
    const response = await request(app)
      .delete('/loans')
      .send({ id: '868272c3-c308-44e8-9a53-e0ccf61e9639' })
      .set({ Authorization: `Bearer ${refreshToken}` });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to delete a loan of another user', async () => {
    // Creating a new loan
    const loanResponse = await request(app)
      .post('/loans')
      .send({
        contact_id,
        value: 50,
        type: LoanType.PAY,
        limit_date: new Date('2030-06-01')
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    const { id } = loanResponse.body;

    // Creating a new user and fetching refresh token
    await request(app).post('/users').send({
      email: 'new@example.com',
      password: '12345'
    });

    const tokenResponse = await request(app).post('/session').send({
      email: 'new@example.com',
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
