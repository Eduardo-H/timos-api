import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let refreshToken: string;
let loan_id: string;

const wrongJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUifQ.KSOCK1xgysHEraNTu4wujkrCR7hfyeNj-TaAkDF5uHo';

describe('Create Payment Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/users').send({
      email: 'test@example.com',
      password: '12345'
    });

    const tokenResponse = await request(app).post('/session').send({
      email: 'test@example.com',
      password: '12345'
    });

    refreshToken = tokenResponse.body.refresh_token;

    const contactResponse = await request(app)
      .post('/contacts')
      .send({
        name: 'John Doe'
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    const loanResponse = await request(app)
      .post('/loans')
      .send({
        contact_id: contactResponse.body.id,
        value: 50,
        type: 'pagar',
        limit_date: new Date('2030-06-01')
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    loan_id = loanResponse.body.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able to create a new payement', async () => {
    const response = await request(app)
      .post('/loans/payment')
      .send({
        loan_id,
        value: 25
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(201);
  });

  it('should not be able to create a payment of a nonexistent loan', async () => {
    const response = await request(app)
      .post('/loans/payment')
      .send({
        loan_id: '868272c3-c308-44e8-9a53-e0ccf61e9639',
        value: 10
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to create a payment for a loan of another user', async () => {
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
      .post('/loans/payment')
      .send({
        loan_id,
        value: 10
      })
      .set({
        Authorization: `Bearer ${refresh_token}`
      });

    expect(response.statusCode).toBe(401);
  });

  it("should not be able to create a payment with a value greater than the loan's value", async () => {
    const response = await request(app)
      .post('/loans/payment')
      .send({
        loan_id,
        value: 100
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to create a payment with a value lower than 1', async () => {
    const response = await request(app)
      .post('/loans/payment')
      .send({
        loan_id,
        value: -50
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to create a payment of a nonexistent user', async () => {
    const response = await request(app)
      .post('/loans/payment')
      .send({
        loan_id,
        value: 10
      })
      .set({
        Authorization: `Bearer ${wrongJWT}`
      });

    expect(response.statusCode).toBe(401);
  });
});
