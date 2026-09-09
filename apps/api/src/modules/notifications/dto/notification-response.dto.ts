import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NOTIFICATION_CHANNELS } from '@wantere/types';

export class NotificationDataDto {
  @ApiPropertyOptional()
  listingId?: string;
}

export class NotificationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: NOTIFICATION_CHANNELS })
  channel!: (typeof NOTIFICATION_CHANNELS)[number];

  @ApiProperty()
  type!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty({ type: NotificationDataDto, nullable: true })
  data!: NotificationDataDto | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  readAt!: string | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  sentAt!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}

export class UnreadCountDto {
  @ApiProperty()
  count!: number;
}
