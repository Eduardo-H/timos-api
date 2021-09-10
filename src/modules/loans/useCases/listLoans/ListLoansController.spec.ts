import { LoanType } from '@modules/loans/infra/typeorm/entities/Loan';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';

let connection: Connection;
let refreshToken: string;
let contact_id: string;

const wrongJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUifQ.KSOCK1xgysHEraNTu4wujkrCR7hfyeNj-TaAkDF5uHo';

describe('List Loans Controller', () => {
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

  it("should be able to list the user's loans", async () => {
    // Creating a new loan
    await request(app)
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

    const response = await request(app)
      .get('/loans')
      .set({ Authorization: `Bearer ${refreshToken}` });

    expect(response.statusCode).toBe(200);
  });

  it('should return status code 204 when the user has no loans', async () => {
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
      .get('/loans')
      .set({ Authorization: `Bearer ${refresh_token}` });

    expect(response.statusCode).toBe(204);
  });

  it('should not be able to list the loans of a nonexistent user', async () => {
    const response = await request(app)
      .get('/loans')
      .set({ Authorization: `Bearer ${wrongJWT}` });

    expect(response.statusCode).toBe(401);
  });
});
