import { LoanType, Status } from '@modules/loans/infra/typeorm/entities/Loan';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';

let connection: Connection;
let refreshToken: string;
let contact_id: string;
let loan_id: string;

const wrongJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUifQ.KSOCK1xgysHEraNTu4wujkrCR7hfyeNj-TaAkDF5uHo';

describe('Update Loan Controller', () => {
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

    contact_id = contactResponse.body.id;

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

    loan_id = loanResponse.body.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to update a loan', async () => {
    const response = await request(app)
      .put('/loans')
      .send({
        id: loan_id,
        contact_id,
        value: 100,
        type: LoanType.RECEIVE,
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: Status.OPEN
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(201);
  });

  it("should not be able to update a loan with a contact that doesn't belong to the user", async () => {
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
      .put('/loans')
      .send({
        id: loan_id,
        contact_id,
        value: 100,
        type: LoanType.RECEIVE,
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: Status.OPEN
      })
      .set({
        Authorization: `Bearer ${refresh_token}`
      });

    expect(response.statusCode).toBe(401);
  });

  it('should not be able to update a loan with the value less than 1', async () => {
    const response = await request(app)
      .put('/loans')
      .send({
        id: loan_id,
        contact_id,
        value: -100,
        type: LoanType.RECEIVE,
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: Status.OPEN
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to update a nonexistent loan', async () => {
    const response = await request(app)
      .put('/loans')
      .send({
        id: '868272c3-c308-44e8-9a53-e0ccf61e9639',
        contact_id,
        value: 100,
        type: LoanType.RECEIVE,
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: Status.OPEN
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to update a loan of a nonexistent user', async () => {
    const response = await request(app)
      .put('/loans')
      .send({
        id: loan_id,
        contact_id,
        value: 100,
        type: LoanType.RECEIVE,
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: Status.OPEN
      })
      .set({
        Authorization: `Bearer ${wrongJWT}`
      });

    expect(response.statusCode).toBe(401);
  });

  it('should not be able to update a loan of a nonexistent contact', async () => {
    const response = await request(app)
      .put('/loans')
      .send({
        id: loan_id,
        contact_id: '868272c3-c308-44e8-9a53-e0ccf61e9639',
        value: 100,
        type: LoanType.RECEIVE,
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: Status.OPEN
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(400);
  });
});
