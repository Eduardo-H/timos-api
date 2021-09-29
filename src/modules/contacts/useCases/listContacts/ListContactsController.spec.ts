import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;

describe('List Contacts Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    // Creating a user
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

    // Creating the connection between the two users
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

  it('should be able to list the users contacts', async () => {
    const response = await request(app)
      .get('/contacts')
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(200);
  });

  it('should be able to paginate results', async () => {
    const response = await request(app)
      .get('/contacts')
      .query({
        page: 1
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(200);
  });

  it('should be able to limit results', async () => {
    const response = await request(app)
      .get('/contacts')
      .query({
        limit: 5
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(200);
  });

  it('should return 204 status when the user have no contacts', async () => {
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
      .get('/contacts')
      .set({
        Authorization: `Bearer ${newUserToken}`
      });

    expect(response.statusCode).toBe(204);
  });
});
