import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';
import { closeRedisConnection } from '@shared/infra/http/middlewares/rateLimiter';

let connection: Connection;
let token: string;
let contact_id: string;

describe('Delete Contact Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

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

    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'new@example.com',
      password: '12345'
    });

    const responseContact = await request(app).post('/session').send({
      email: 'new@example.com',
      password: '12345'
    });

    contact_id = responseContact.body.user.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    closeRedisConnection();
  });

  it('should be able to delete a contact', async () => {
    await request(app)
      .post('/contacts')
      .send({
        contact_id
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const response = await request(app)
      .delete('/contacts')
      .send({
        contact_id
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(200);
  });

  it('should not be able to delete a nonexistent contact', async () => {
    const response = await request(app)
      .delete('/contacts')
      .send({
        id: '868272c3-c308-44e8-9a53-e0ccf61e9639'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to delete of a different user', async () => {
    // Creating a new contact
    await request(app)
      .post('/contacts')
      .send({
        contact_id
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    // Creating a new user and fetching its refresh token
    await request(app).post('/users').send({
      name: 'John Doe',
      email: 'other@example.com',
      password: '12345'
    });

    const tokenResponse = await request(app).post('/session').send({
      email: 'other@example.com',
      password: '12345'
    });

    const newUserToken = tokenResponse.body.token;

    // Trying to delete the contact with the newly created user
    const response = await request(app)
      .delete('/contacts')
      .send({
        contact_id
      })
      .set({
        Authorization: `Bearer ${newUserToken}`
      });

    expect(response.statusCode).toBe(400);
  });
});
