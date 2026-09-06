import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { QUEUE_NOTIFICATIONS, type NotificationJob } from '../../infrastructure/queues/queues';

/**
 * Delivery providers are not wired yet; the job marks the notification as sent so
 * the queue contract and retry behaviour are already in place.
 */
@Processor(QUEUE_NOTIFICATIONS)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<NotificationJob>): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: job.data.notificationId },
    });

    if (!notification) {
      this.logger.warn(`Notification ${job.data.notificationId} no longer exists`);
      return;
    }

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: { sentAt: new Date() },
    });
  }
}
