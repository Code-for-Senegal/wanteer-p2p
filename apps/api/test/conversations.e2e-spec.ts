import request from 'supertest';
import { buildOpenApiDocument } from '../src/bootstrap';
import { MESSAGE_LIMITS } from '@wantere/config';
import { createTestApp, type TestContext } from './setup';

const PHONES = {
  owner: '+221770000051',
  interested: '+221770000052',
  stranger: '+221770000053',
} as const;

type Member = keyof typeof PHONES;

describe('Listing conversations', () => {
  let context: TestContext;
  let categoryId: string;
  let listingId: string;
  let conversationId: string;
  const tokens = {} as Record<Member, string>;
  const ids = {} as Record<Member, string>;

  const server = () => request(context.app.getHttpServer());
  const as = (member: Member) => ({ Authorization: `Bearer ${tokens[member]}` });

  async function signIn(member: Member, displayName: string): Promise<void> {
    const phone = PHONES[member];
    const challenge = await server()
      .post(context.path('/auth/register'))
      .send({ phone, displayName })
      .expect(201);
    const verified = await server()
      .post(context.path('/auth/verify'))
      .send({ phone, code: challenge.body.code, platform: 'web' })
      .expect(200);
    tokens[member] = verified.body.accessToken;
    const me = await server().get(context.path('/auth/me')).set(as(member)).expect(200);
    ids[member] = me.body.id;
  }

  async function publish(title: string): Promise<string> {
    const response = await server()
      .post(context.path('/listings'))
      .set(as('owner'))
      .send({
        title,
        description: 'Test',
        type: 'DONATION',
        categoryId,
        latitude: 14.6928,
        longitude: -17.4467,
      })
      .expect(201);
    return response.body.id;
  }

  beforeAll(async () => {
    context = await createTestApp();

    await context.prisma.user.deleteMany({ where: { phone: { in: Object.values(PHONES) } } });
    for (const phone of Object.values(PHONES)) {
      await context.redis.client.del(`otp:cooldown:${phone}`);
    }

    const category = await context.prisma.category.upsert({
      where: { slug: 'e2e-conversations' },
      create: { name: 'E2E conversations', slug: 'e2e-conversations' },
      update: {},
    });
    categoryId = category.id;

    await signIn('owner', 'Awa');
    await signIn('interested', 'Moussa');
    await signIn('stranger', 'Fatou');

    listingId = await publish('Cartable à donner');
  });

  afterAll(async () => {
    await context.prisma.user.deleteMany({ where: { phone: { in: Object.values(PHONES) } } });
    await context.prisma.category.deleteMany({ where: { slug: 'e2e-conversations' } });
    await context.app.close();
  });

  it('publishes concrete response schemas for every conversation endpoint', () => {
    const document = buildOpenApiDocument(context.app);
    const responses = [
      ['/api/v1/conversations', 'post', '201', 'ConversationView'],
      ['/api/v1/conversations', 'get', '200', 'ConversationPageView'],
      ['/api/v1/conversations/{id}', 'get', '200', 'ConversationView'],
      ['/api/v1/conversations/{id}/messages', 'get', '200', 'MessagePageView'],
      ['/api/v1/conversations/{id}/messages', 'post', '201', 'MessageView'],
    ] as const;
    for (const [path, method, status, schema] of responses) {
      expect(document.paths[path]?.[method]?.responses[status]).toMatchObject({
        content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } },
      });
    }
  });

  it('refuses anonymous access', async () => {
    await server().post(context.path('/conversations')).send({ listingId }).expect(401);
    await server().get(context.path('/conversations')).expect(401);
  });

  it('lets an interested member start a conversation on an active listing', async () => {
    const response = await server()
      .post(context.path('/conversations'))
      .set(as('interested'))
      .send({ listingId })
      .expect(201);

    conversationId = response.body.id;
    expect(response.body.listing.id).toBe(listingId);
    expect(response.body.lastMessage).toBeNull();
    expect(response.body.participants).toEqual([
      expect.objectContaining({ id: ids.owner, displayName: 'Awa', role: 'OWNER' }),
      expect.objectContaining({ id: ids.interested, displayName: 'Moussa', role: 'INTERESTED' }),
    ]);
  });

  it('never exposes phone numbers, location or moderation state', async () => {
    const response = await server()
      .get(context.path(`/conversations/${conversationId}`))
      .set(as('owner'))
      .expect(200);

    const raw = JSON.stringify(response.body);
    for (const phone of Object.values(PHONES)) {
      expect(raw).not.toContain(phone);
    }
    expect(Object.keys(response.body.participants[0]).sort()).toEqual([
      'avatarUrl',
      'displayName',
      'id',
      'memberSince',
      'role',
    ]);
    expect(response.body.listing).not.toHaveProperty('location');
    expect(response.body.listing).not.toHaveProperty('status');
  });

  it('reuses the conversation on repeated and concurrent contact requests', async () => {
    const again = await server()
      .post(context.path('/conversations'))
      .set(as('interested'))
      .send({ listingId })
      .expect(201);
    expect(again.body.id).toBe(conversationId);

    const otherListingId = await publish('Livres à donner');
    const responses = await Promise.all(
      Array.from({ length: 6 }, () =>
        server()
          .post(context.path('/conversations'))
          .set(as('interested'))
          .send({ listingId: otherListingId })
          .expect(201),
      ),
    );

    const distinct = new Set(responses.map((response) => response.body.id));
    expect(distinct.size).toBe(1);
    expect(await context.prisma.conversation.count({ where: { listingId: otherListingId } })).toBe(
      1,
    );
  });

  it('refuses a conversation with oneself', async () => {
    await server()
      .post(context.path('/conversations'))
      .set(as('owner'))
      .send({ listingId })
      .expect(400);
  });

  it('refuses new conversations on listings that are not active', async () => {
    const draft = await context.prisma.listing.create({
      data: {
        sellerId: ids.owner,
        categoryId,
        title: 'Brouillon',
        description: 'Pas encore publié',
        type: 'DONATION',
        status: 'DRAFT',
      },
    });

    await server()
      .post(context.path('/conversations'))
      .set(as('interested'))
      .send({ listingId: draft.id })
      .expect(409);

    await server()
      .post(context.path('/conversations'))
      .set(as('interested'))
      .send({ listingId: '3f1a8f0e-0000-4000-8000-000000000000' })
      .expect(404);
  });

  it('validates the message body', async () => {
    for (const body of ['', '   ', 'x'.repeat(MESSAGE_LIMITS.bodyMax + 1)]) {
      await server()
        .post(context.path(`/conversations/${conversationId}/messages`))
        .set(as('interested'))
        .send({ body })
        .expect(400);
    }

    await server()
      .post(context.path(`/conversations/${conversationId}/messages`))
      .set(as('interested'))
      .send({ body: 'Bonjour', attachment: 'photo.jpg' })
      .expect(400);
  });

  it('lets the owner and the interested member exchange messages', async () => {
    const first = await server()
      .post(context.path(`/conversations/${conversationId}/messages`))
      .set(as('interested'))
      .send({ body: '  Bonjour, le cartable est-il toujours disponible ?  ' })
      .expect(201);
    expect(first.body.body).toBe('Bonjour, le cartable est-il toujours disponible ?');
    expect(first.body.senderId).toBe(ids.interested);

    const seenByOwner = await server()
      .get(context.path(`/conversations/${conversationId}/messages`))
      .set(as('owner'))
      .expect(200);
    expect(seenByOwner.body.items).toHaveLength(1);

    const reply = await server()
      .post(context.path(`/conversations/${conversationId}/messages`))
      .set(as('owner'))
      .send({ body: 'Oui, il est disponible.' })
      .expect(201);
    expect(reply.body.senderId).toBe(ids.owner);

    const thread = await server()
      .get(context.path(`/conversations/${conversationId}/messages?pageSize=1&page=1`))
      .set(as('interested'))
      .expect(200);
    expect(thread.body.meta).toEqual({ page: 1, pageSize: 1, total: 2, totalPages: 2 });
    expect(thread.body.items[0].body).toBe('Oui, il est disponible.');

    const inbox = await server().get(context.path('/conversations')).set(as('owner')).expect(200);
    expect(inbox.body.items[0].id).toBe(conversationId);
    expect(inbox.body.items[0].lastMessage.body).toBe('Oui, il est disponible.');
  });

  it('does not overwrite a newer activity timestamp with an older send', async () => {
    const otherListingId = await publish('Test activité');
    const started = await server()
      .post(context.path('/conversations'))
      .set(as('interested'))
      .send({ listingId: otherListingId })
      .expect(201);
    // Model another request having already committed a newer message timestamp.
    const newer = new Date(Date.now() + 60_000);
    await context.prisma.conversation.update({
      where: { id: started.body.id },
      data: { lastActivityAt: newer },
    });
    await server()
      .post(context.path(`/conversations/${started.body.id}/messages`))
      .set(as('interested'))
      .send({ body: 'Message retardé' })
      .expect(201);
    const conversation = await context.prisma.conversation.findUniqueOrThrow({
      where: { id: started.body.id },
    });
    expect(conversation.lastActivityAt).toEqual(newer);
  });

  it('keeps other members out of the conversation', async () => {
    await server()
      .get(context.path(`/conversations/${conversationId}`))
      .set(as('stranger'))
      .expect(404);
    await server()
      .get(context.path(`/conversations/${conversationId}/messages`))
      .set(as('stranger'))
      .expect(404);
    await server()
      .post(context.path(`/conversations/${conversationId}/messages`))
      .set(as('stranger'))
      .send({ body: 'Coucou' })
      .expect(404);

    const inbox = await server()
      .get(context.path('/conversations'))
      .set(as('stranger'))
      .expect(200);
    expect(inbox.body.items).toHaveLength(0);
  });

  it('lets participants finish the exchange after the listing is archived', async () => {
    await server()
      .delete(context.path(`/listings/${listingId}`))
      .set(as('owner'))
      .expect(204);

    await server()
      .post(context.path(`/conversations/${conversationId}/messages`))
      .set(as('interested'))
      .send({ body: 'Je passe demain à 18h.' })
      .expect(201);

    const thread = await server()
      .get(context.path(`/conversations/${conversationId}/messages`))
      .set(as('owner'))
      .expect(200);
    expect(thread.body.items[0].body).toBe('Je passe demain à 18h.');

    await server()
      .post(context.path('/conversations'))
      .set(as('stranger'))
      .send({ listingId })
      .expect(409);
  });
});
