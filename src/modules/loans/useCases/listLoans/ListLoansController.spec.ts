import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;
let contact_id: string;

const wrongJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUifQ.KSOCK1xgysHEraNTu4wujkrCR7hfyeNj-TaAkDF5uHo';

describe('List Loans Controller', () => {
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

    // Creatin the connection between the two users
    await request(app)
      .post('/contacts')
      .send({
        contact_id
      })
      .set({
        Authorization: `Bearer ${token}`
      });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it("should be able to list the user's loans", async () => {
    // Creating a new loan
    await request(app)
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

    const response = await request(app)
      .get('/loans')
      .set({ Authorization: `Bearer ${token}` });

    expect(response.statusCode).toBe(200);
  });

  it('should return status code 204 when the user has no loans', async () => {
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
      .get('/loans')
      .set({ Authorization: `Bearer ${newUserToken}` });

    expect(response.statusCode).toBe(204);
  });

  it('should not be able to list the loans of a nonexistent user', async () => {
    const response = await request(app)
      .get('/loans')
      .set({ Authorization: `Bearer ${wrongJWT}` });

    expect(response.statusCode).toBe(401);
  });
});
