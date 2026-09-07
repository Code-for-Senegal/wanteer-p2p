import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { Prisma } from '../../generated/prisma/client';
import { paginate, type PaginationQueryDto } from '../../common/dto/pagination.dto';
import { toPublicMember } from '../users/public-member';
import type { ConversationView, MessageView } from './conversation.serializer';

const conversationInclude = {
  listing: {
    select: {
      id: true,
      title: true,
      type: true,
      price: true,
      currency: true,
      media: { orderBy: { sortOrder: 'asc' }, take: 1, select: { storageKey: true } },
    },
  },
  participants: {
    orderBy: { role: 'asc' },
    include: { user: { include: { profile: true } } },
  },
  messages: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1 },
} satisfies Prisma.ConversationInclude;

type ConversationRecord = Prisma.ConversationGetPayload<{ include: typeof conversationInclude }>;

/**
 * Both lists are ordered by activity or time first and by id second, so two
 * rows created in the same millisecond still come back in a stable order
 * across pages.
 */
const conversationOrder = [
  { lastActivityAt: 'desc' },
  { id: 'desc' },
] satisfies Prisma.ConversationOrderByWithRelationInput[];

const messageOrder = [
  { createdAt: 'desc' },
  { id: 'desc' },
] satisfies Prisma.MessageOrderByWithRelationInput[];

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Returns the existing conversation for this listing and member, or opens
   * one. Only the opening is subject to the listing being ACTIVE: participants
   * keep their conversation after the listing is archived so they can finish
   * an exchange. The unique index on (listingId, interestedId) is what makes
   * two simultaneous requests converge on one row.
   */
  async startOrReuse(userId: string, listingId: string): Promise<ConversationView> {
    const existing = await this.findByPair(listingId, userId);
    if (existing) {
      return this.toView(existing);
    }

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        // Hold eligibility stable until creation commits; status changes must wait.
        const [listing] = await tx.$queryRaw<{ sellerId: string; status: string }[]>`
          SELECT "sellerId", "status" FROM "listings"
          WHERE "id" = ${listingId}::uuid FOR SHARE
        `;
        if (!listing || listing.status === 'REJECTED') {
          throw new NotFoundException('Listing not found');
        }

        if (listing.sellerId === userId) {
          throw new BadRequestException('You cannot start a conversation on your own listing');
        }

        if (listing.status !== 'ACTIVE') {
          throw new ConflictException('This listing is not open to new conversations');
        }

        return tx.conversation.create({
          data: {
            listingId,
            interestedId: userId,
            participants: {
              create: [
                { userId: listing.sellerId, role: 'OWNER' },
                { userId, role: 'INTERESTED' },
              ],
            },
          },
          include: conversationInclude,
        });
      });

      return this.toView(created);
    } catch (error) {
      if (!this.isUniqueViolation(error)) {
        throw error;
      }
    }

    // Lost the race against a concurrent request: the other one won the insert.
    const winner = await this.findByPair(listingId, userId);
    if (!winner) {
      throw new ConflictException('Conversation could not be opened');
    }

    return this.toView(winner);
  }

  async findForMember(userId: string, query: PaginationQueryDto) {
    const where: Prisma.ConversationWhereInput = { participants: { some: { userId } } };

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        include: conversationInclude,
        orderBy: conversationOrder,
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return paginate(
      conversations.map((conversation) => this.toView(conversation)),
      total,
      query,
    );
  }

  async findOne(conversationId: string, userId: string): Promise<ConversationView> {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { userId } } },
      include: conversationInclude,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.toView(conversation);
  }

  async findMessages(conversationId: string, userId: string, query: PaginationQueryDto) {
    await this.assertParticipant(conversationId, userId);

    const where: Prisma.MessageWhereInput = { conversationId };

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: messageOrder,
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.message.count({ where }),
    ]);

    return paginate(
      messages.map((message) => this.toMessage(message)),
      total,
      query,
    );
  }

  async sendMessage(conversationId: string, userId: string, body: string): Promise<MessageView> {
    await this.assertParticipant(conversationId, userId);

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.message.create({ data: { conversationId, senderId: userId, body } });
      // A delayed concurrent send must not move the inbox activity timestamp backwards.
      await tx.conversation.updateMany({
        where: { id: conversationId, lastActivityAt: { lt: created.createdAt } },
        data: { lastActivityAt: created.createdAt },
      });
      return created;
    });

    return this.toMessage(message);
  }

  private findByPair(listingId: string, interestedId: string) {
    return this.prisma.conversation.findUnique({
      where: { listingId_interestedId: { listingId, interestedId } },
      include: conversationInclude,
    });
  }

  /**
   * A conversation the member is not part of is reported as missing rather
   * than forbidden, so the endpoint does not confirm that it exists.
   */
  private async assertParticipant(conversationId: string, userId: string): Promise<void> {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      select: { id: true },
    });

    if (!participant) {
      throw new NotFoundException('Conversation not found');
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private toView(conversation: ConversationRecord): ConversationView {
    const publicUrl = (key: string) => this.storage.publicUrl(key);
    const [lastMessage] = conversation.messages;

    return {
      id: conversation.id,
      listing: {
        id: conversation.listing.id,
        title: conversation.listing.title,
        type: conversation.listing.type,
        price: conversation.listing.price,
        currency: conversation.listing.currency,
        coverUrl: conversation.listing.media[0]
          ? publicUrl(conversation.listing.media[0].storageKey)
          : null,
      },
      participants: conversation.participants.map((participant) => ({
        ...toPublicMember(participant.user, publicUrl),
        role: participant.role,
      })),
      lastMessage: lastMessage ? this.toMessage(lastMessage) : null,
      lastActivityAt: conversation.lastActivityAt.toISOString(),
      createdAt: conversation.createdAt.toISOString(),
    };
  }

  private toMessage(message: {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
    createdAt: Date;
  }): MessageView {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
