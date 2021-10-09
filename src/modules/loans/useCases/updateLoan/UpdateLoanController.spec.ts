import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;
let loan_id: string;

const wrongJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUifQ.KSOCK1xgysHEraNTu4wujkrCR7hfyeNj-TaAkDF5uHo';

describe('Update Loan Controller', () => {
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

    loan_id = loanResponse.body.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able to update a loan', async () => {
    const response = await request(app)
      .put('/loans')
      .send({
        id: loan_id,
        value: 100,
        type: 'receber',
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: 'aberto'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(201);
  });

  it("should not be able to update a loan with a contact that doesn't belong to the user", async () => {
    await request(app).post('/users').send({
      name: 'John Doe',
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
        value: 100,
        type: 'receber',
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: 'aberto'
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
        value: -100,
        type: 'receber',
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: 'aberto'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to update a nonexistent loan', async () => {
    const response = await request(app)
      .put('/loans')
      .send({
        id: '868272c3-c308-44e8-9a53-e0ccf61e9639',
        value: 100,
        type: 'receber',
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: 'aberto'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to update a loan of a nonexistent user', async () => {
    const response = await request(app)
      .put('/loans')
      .send({
        id: loan_id,
        value: 100,
        type: 'receber',
        limit_date: new Date('2030-06-01'),
        closed_at: null,
        status: 'aberto'
      })
      .set({
        Authorization: `Bearer ${wrongJWT}`
      });

    expect(response.statusCode).toBe(401);
  });
});
