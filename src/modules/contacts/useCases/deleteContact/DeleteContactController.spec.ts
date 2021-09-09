import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';

let connection: Connection;
let refreshToken: string;

describe('Delete Contact Controller', () => {
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
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to delete a contact', async () => {
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
      .delete('/contacts')
      .send({
        id
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
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
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(400);
  });

  it('should not be able to delete of a different user', async () => {
    // Creating a new user and fetching its refresh token
    await request(app).post('/users').send({
      email: 'new@example.com',
      password: '12345'
    });

    const tokenResponse = await request(app).post('/session').send({
      email: 'new@example.com',
      password: '12345'
    });

    const { refresh_token } = tokenResponse.body;

    // Creating a new contact with a different user
    const contactResponse = await request(app)
      .post('/contacts')
      .send({
        name: 'John Doe'
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    const { id } = contactResponse.body;

    // Trying to delete the contact with the newly created user
    const response = await request(app)
      .delete('/contacts')
      .send({
        id
      })
      .set({
        Authorization: `Bearer ${refresh_token}`
      });

    expect(response.statusCode).toBe(403);
  });
});
