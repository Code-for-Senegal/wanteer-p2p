import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { NotificationChannel } from '@wantere/types';
import { PrismaService } from '../../database/prisma.service';
import type { Prisma } from '../../generated/prisma/client';
import { paginate, type PaginationQueryDto } from '../../common/dto/pagination.dto';
import { QUEUE_NOTIFICATIONS, type NotificationJob } from '../../infrastructure/queues/queues';

export interface NotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  channel?: NotificationChannel;
  data?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NOTIFICATIONS) private readonly queue: Queue<NotificationJob>,
  ) {}

  /** Persist first, deliver asynchronously: the in-app feed never depends on a provider. */
  async dispatch(input: NotificationInput): Promise<{ id: string }> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        channel: input.channel ?? 'IN_APP',
        data: input.data ?? undefined,
      },
    });

    if (notification.channel !== 'IN_APP') {
      await this.queue.add('deliver', { notificationId: notification.id });
    }

    return { id: notification.id };
  }

  async list(userId: string, query: PaginationQueryDto) {
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return paginate(notifications, total, query);
  }

  unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markAsRead(userId: string, id: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
