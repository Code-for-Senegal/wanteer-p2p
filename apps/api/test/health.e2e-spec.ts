import request from 'supertest';
import { createTestApp, type TestContext } from './setup';

describe('Health', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('reports liveness without authentication', async () => {
    const response = await request(context.app.getHttpServer()).get('/health').expect(200);
    expect(response.body.status).toBe('ok');
  });

  it('reports Postgres and Redis on the readiness probe', async () => {
    const response = await request(context.app.getHttpServer()).get('/health/ready').expect(200);
    expect(response.body.info).toMatchObject({
      database: { status: 'up' },
      redis: { status: 'up' },
    });
  });
});
