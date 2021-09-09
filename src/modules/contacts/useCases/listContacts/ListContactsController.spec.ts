import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '@shared/infra/http/app';

let connection: Connection;
let refreshToken: string;

async function createContacts(size: number) {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < size; i++) {
    // eslint-disable-next-line no-await-in-loop
    await request(app)
      .post('/contacts')
      .send({
        name: `John Doe #${i}`
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
      });
  }
}

describe('List Contacts Controller', () => {
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

    await createContacts(15);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to list the users contacts', async () => {
    const response = await request(app)
      .get('/contacts')
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(200);
  });

  it('should be able to paginate results', async () => {
    const response = await request(app)
      .get('/contacts')
      .set({
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(200);
  });

  it('should be able to limit results', async () => {
    const response = await request(app)
      .get('/contacts')
      .query({
        page: 1
      })
      .set({
        Authorization: `Bearer ${refreshToken}`
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
        Authorization: `Bearer ${refreshToken}`
      });

    expect(response.statusCode).toBe(200);
  });

  it('should return 204 status when the user have no contacts', async () => {
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
      .get('/contacts')
      .set({
        Authorization: `Bearer ${refresh_token}`
      });

    expect(response.statusCode).toBe(204);
  });

  it('should not be able to list contacts of a different user', async () => {
    const tokenResponse = await request(app).post('/session').send({
      email: 'new@example.com',
      password: '12345'
    });

    const { refresh_token } = tokenResponse.body;

    const response = await request(app)
      .get('/contacts')
      .set({
        Authorization: `Bearer ${refresh_token}`
      });

    expect(response.statusCode).toBe(204);
  });
});
