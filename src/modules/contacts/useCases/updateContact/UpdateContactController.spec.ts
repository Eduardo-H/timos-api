import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let refreshToken: string;

describe('Update Contact Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/users').send({
      email: 'test@example.com',
      password: '12345'
    });

    const responseToken = await request(app).post('/session').send({
      email: 'test@example.com',
      password: '12345'
    });

    refreshToken = responseToken.body.refresh_token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able update a contact', async () => {
    const contactResponse = await request(app)
      .post('/contacts')
      .send({
        name: 'John Doe'
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    const { id } = contactResponse.body;

    const response = await request(app)
      .put('/contacts')
      .send({
        id,
        name: 'Trevor Slow'
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(201);
  });

  it('should not be able to update a nonexistent contact', async () => {
    const response = await request(app)
      .put('/contacts')
      .send({
        id: '868272c3-c308-44e8-9a53-e0ccf61e9639',
        name: 'Trevor Slow'
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to update a contact with a repeated name', async () => {
    const contactResponse = await request(app)
      .post('/contacts')
      .send({
        name: 'Marry Sleepy'
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    const { id } = contactResponse.body;

    const response = await request(app)
      .put('/contacts')
      .send({
        id,
        name: 'Trevor Slow'
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(400);
  });
});
