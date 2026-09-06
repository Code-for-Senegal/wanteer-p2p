import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env';
import { QUEUE_INDEXING, QUEUE_MEDIA, QUEUE_NOTIFICATIONS, QUEUE_SYSTEM } from './queues';
import { SystemProcessor } from './system.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        connection: { url: config.get('REDIS_URL', { infer: true }) },
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { age: 3600, count: 1000 },
          removeOnFail: { age: 86400 },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NOTIFICATIONS },
      { name: QUEUE_MEDIA },
      { name: QUEUE_INDEXING },
      { name: QUEUE_SYSTEM },
    ),
  ],
  providers: [SystemProcessor],
  exports: [BullModule],
})
export class QueuesModule {}
