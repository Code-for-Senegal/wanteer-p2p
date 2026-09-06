import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { QUEUE_SYSTEM, type SystemJob } from './queues';

@Processor(QUEUE_SYSTEM)
export class SystemProcessor extends WorkerHost {
  private readonly logger = new Logger(SystemProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<SystemJob>): Promise<void> {
    const now = new Date();

    switch (job.data.task) {
      case 'purge-expired-sessions': {
        const { count } = await this.prisma.session.deleteMany({
          where: { expiresAt: { lt: now } },
        });
        this.logger.log(`Purged ${count} expired sessions`);
        break;
      }
      case 'purge-expired-verifications': {
        const { count } = await this.prisma.phoneVerification.deleteMany({
          where: { expiresAt: { lt: now } },
        });
        this.logger.log(`Purged ${count} expired phone verifications`);
        break;
      }
    }
  }
}
