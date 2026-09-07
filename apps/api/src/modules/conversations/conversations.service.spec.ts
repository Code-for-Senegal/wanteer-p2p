import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { ConversationsService } from './conversations.service';

describe('ConversationsService', () => {
  const listingId = '3f1a8f0e-0000-4000-8000-000000000010';
  const ownerId = '3f1a8f0e-0000-4000-8000-000000000011';
  const interestedId = '3f1a8f0e-0000-4000-8000-000000000012';
  const strangerId = '3f1a8f0e-0000-4000-8000-000000000013';
  const conversationId = '3f1a8f0e-0000-4000-8000-000000000020';

  const now = new Date('2026-09-07T10:00:00.000Z');

  const conversationRecord = {
    id: conversationId,
    listingId,
    interestedId,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
    listing: {
      id: listingId,
      title: 'Cartable',
      type: 'SALE',
      status: 'ACTIVE',
      price: 5000,
      currency: 'XOF',
      media: [],
    },
    participants: [
      {
        role: 'OWNER',
        user: { id: ownerId, createdAt: now, profile: { displayName: 'Awa', avatarKey: null } },
      },
      {
        role: 'INTERESTED',
        user: { id: interestedId, createdAt: now, profile: null },
      },
    ],
    messages: [],
  };

  const prisma = {
    listing: { findUnique: jest.fn() },
    conversation: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    conversationParticipant: { findUnique: jest.fn() },
    message: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  };

  let service: ConversationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: { publicUrl: (key: string) => `cdn/${key}` } },
      ],
    }).compile();

    service = moduleRef.get(ConversationsService);
  });

  describe('startOrReuse', () => {
    it('returns the existing conversation without looking at the listing', async () => {
      prisma.conversation.findUnique.mockResolvedValue(conversationRecord);

      const view = await service.startOrReuse(interestedId, listingId);

      expect(view.id).toBe(conversationId);
      expect(prisma.listing.findUnique).not.toHaveBeenCalled();
      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    it('refuses a conversation on the member’s own listing', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);
      prisma.listing.findUnique.mockResolvedValue({ sellerId: ownerId, status: 'ACTIVE' });

      await expect(service.startOrReuse(ownerId, listingId)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    it.each(['DRAFT', 'RESERVED', 'COMPLETED', 'ARCHIVED'])(
      'refuses to open a conversation on a %s listing',
      async (status) => {
        prisma.conversation.findUnique.mockResolvedValue(null);
        prisma.listing.findUnique.mockResolvedValue({ sellerId: ownerId, status });

        await expect(service.startOrReuse(interestedId, listingId)).rejects.toBeInstanceOf(
          ConflictException,
        );
        expect(prisma.conversation.create).not.toHaveBeenCalled();
      },
    );

    it('treats a rejected listing as missing', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);
      prisma.listing.findUnique.mockResolvedValue({ sellerId: ownerId, status: 'REJECTED' });

      await expect(service.startOrReuse(interestedId, listingId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('opens a conversation with the owner and the interested member', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);
      prisma.listing.findUnique.mockResolvedValue({ sellerId: ownerId, status: 'ACTIVE' });
      prisma.conversation.create.mockResolvedValue(conversationRecord);

      const view = await service.startOrReuse(interestedId, listingId);

      expect(prisma.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            listingId,
            interestedId,
            participants: {
              create: [
                { userId: ownerId, role: 'OWNER' },
                { userId: interestedId, role: 'INTERESTED' },
              ],
            },
          },
        }),
      );
      expect(view.participants.map((participant) => participant.role)).toEqual([
        'OWNER',
        'INTERESTED',
      ]);
    });

    it('returns the winner when a concurrent request opened the conversation first', async () => {
      prisma.conversation.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(conversationRecord);
      prisma.listing.findUnique.mockResolvedValue({ sellerId: ownerId, status: 'ACTIVE' });
      prisma.conversation.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      const view = await service.startOrReuse(interestedId, listingId);

      expect(view.id).toBe(conversationId);
      expect(prisma.conversation.findUnique).toHaveBeenCalledTimes(2);
    });

    it('does not swallow other database errors', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);
      prisma.listing.findUnique.mockResolvedValue({ sellerId: ownerId, status: 'ACTIVE' });
      prisma.conversation.create.mockRejectedValue(new Error('connection lost'));

      await expect(service.startOrReuse(interestedId, listingId)).rejects.toThrow(
        'connection lost',
      );
    });
  });

  describe('participant-only access', () => {
    it('reports a conversation the member is not part of as missing', async () => {
      prisma.conversationParticipant.findUnique.mockResolvedValue(null);

      await expect(
        service.findMessages(conversationId, strangerId, new PaginationQueryDto()),
      ).rejects.toBeInstanceOf(NotFoundException);
      await expect(
        service.sendMessage(conversationId, strangerId, 'Bonjour'),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.message.findMany).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('lets a participant keep writing regardless of the listing status', async () => {
      prisma.conversationParticipant.findUnique.mockResolvedValue({ id: 'participant' });
      prisma.$transaction.mockResolvedValue([
        {
          id: 'm1',
          conversationId,
          senderId: interestedId,
          body: 'On se voit demain ?',
          createdAt: now,
        },
        {},
      ]);

      const message = await service.sendMessage(
        conversationId,
        interestedId,
        'On se voit demain ?',
      );

      expect(message.body).toBe('On se voit demain ?');
      expect(prisma.listing.findUnique).not.toHaveBeenCalled();
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: conversationId },
        data: { lastActivityAt: expect.any(Date) },
      });
    });
  });

  describe('serialisation', () => {
    it('exposes only the safe member shape for participants', async () => {
      prisma.conversation.findFirst.mockResolvedValue({
        ...conversationRecord,
        participants: [
          {
            role: 'OWNER',
            user: {
              id: ownerId,
              phone: '+221770000000',
              email: 'awa@example.com',
              status: 'SUSPENDED',
              createdAt: now,
              profile: { displayName: 'Awa', avatarKey: 'avatars/awa.jpg', city: 'Dakar' },
            },
          },
        ],
      });

      const view = await service.findOne(conversationId, ownerId);

      expect(view.participants).toEqual([
        {
          id: ownerId,
          displayName: 'Awa',
          avatarUrl: 'cdn/avatars/awa.jpg',
          memberSince: now.toISOString(),
          role: 'OWNER',
        },
      ]);
    });

    it('orders lists deterministically with the id as tie-breaker', async () => {
      prisma.conversation.findMany.mockResolvedValue([]);
      prisma.conversation.count.mockResolvedValue(0);
      prisma.conversationParticipant.findUnique.mockResolvedValue({ id: 'participant' });
      prisma.message.findMany.mockResolvedValue([]);
      prisma.message.count.mockResolvedValue(0);

      await service.findForMember(ownerId, new PaginationQueryDto());
      await service.findMessages(conversationId, ownerId, new PaginationQueryDto());

      expect(prisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: [{ lastActivityAt: 'desc' }, { id: 'desc' }] }),
      );
      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }),
      );
    });
  });
});
