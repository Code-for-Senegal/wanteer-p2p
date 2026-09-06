import request from 'supertest';
import { createTestApp, type TestContext } from './setup';

const PHONE = '+221770000042';

describe('Listing lifecycle', () => {
  let context: TestContext;
  let accessToken: string;
  let categoryId: string;
  let listingId: string;

  beforeAll(async () => {
    context = await createTestApp();

    await context.prisma.user.deleteMany({ where: { phone: PHONE } });
    await context.redis.client.del(`otp:cooldown:${PHONE}`);

    const category = await context.prisma.category.upsert({
      where: { slug: 'e2e-category' },
      create: { name: 'E2E', slug: 'e2e-category' },
      update: {},
    });
    categoryId = category.id;

    const server = request(context.app.getHttpServer());

    const challenge = await server
      .post(context.path('/auth/register'))
      .send({ phone: PHONE, displayName: 'Test Member' })
      .expect(201);

    const tokens = await server
      .post(context.path('/auth/verify'))
      .send({ phone: PHONE, code: challenge.body.code, platform: 'web' })
      .expect(200);

    accessToken = tokens.body.accessToken;
  });

  afterAll(async () => {
    await context.prisma.user.deleteMany({ where: { phone: PHONE } });
    await context.prisma.category.deleteMany({ where: { slug: 'e2e-category' } });
    await context.app.close();
  });

  it('returns the authenticated account', async () => {
    const response = await request(context.app.getHttpServer())
      .get(context.path('/auth/me'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.phone).toBe(PHONE);
    expect(response.body.displayName).toBe('Test Member');
  });

  it('rejects a sale without a price', async () => {
    await request(context.app.getHttpServer())
      .post(context.path('/listings'))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Vélo sans prix',
        description: 'Test',
        type: 'SALE',
        categoryId,
        latitude: 14.6928,
        longitude: -17.4467,
      })
      .expect(400);
  });

  it('publishes a listing', async () => {
    const response = await request(context.app.getHttpServer())
      .post(context.path('/listings'))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Cartable en bon état',
        description: 'Cartable utilisé une année scolaire.',
        type: 'SALE',
        condition: 'GOOD',
        price: 5000,
        categoryId,
        latitude: 14.6928,
        longitude: -17.4467,
        city: 'Dakar',
        district: 'Medina',
      })
      .expect(201);

    listingId = response.body.id;
    expect(response.body.price).toBe(5000);
  });

  it('never exposes the exact coordinates', async () => {
    const response = await request(context.app.getHttpServer())
      .get(context.path(`/listings/${listingId}`))
      .expect(200);

    expect(response.body.location.latitude).not.toBe(14.6928);
    expect(response.body.location.displayName).toBe('Medina, Dakar');
  });

  it('finds the listing by text and by proximity', async () => {
    const server = request(context.app.getHttpServer());

    const byText = await server.get(context.path('/listings?q=cartable')).expect(200);
    expect(byText.body.items.some((item: { id: string }) => item.id === listingId)).toBe(true);

    const nearby = await server
      .get(context.path('/listings?latitude=14.6930&longitude=-17.4470&radius=2000'))
      .expect(200);
    expect(nearby.body.items.some((item: { id: string }) => item.id === listingId)).toBe(true);

    const faraway = await server
      .get(context.path('/listings?latitude=12.6392&longitude=-8.0029&radius=1000'))
      .expect(200);
    expect(faraway.body.items).toHaveLength(0);
  });

  it('adds and removes the listing from favorites', async () => {
    const server = request(context.app.getHttpServer());

    await server
      .post(context.path('/favorites'))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ listingId })
      .expect(201);

    const favorites = await server
      .get(context.path('/favorites'))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(favorites.body.items).toHaveLength(1);

    await server
      .delete(context.path(`/favorites/${listingId}`))
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });

  it('refuses anonymous publication', async () => {
    await request(context.app.getHttpServer())
      .post(context.path('/listings'))
      .send({
        title: 'Anonyme',
        description: '',
        type: 'DONATION',
        categoryId,
        latitude: 0,
        longitude: 0,
      })
      .expect(401);
  });
});
