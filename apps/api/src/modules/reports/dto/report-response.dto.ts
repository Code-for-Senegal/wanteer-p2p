import { ApiProperty } from '@nestjs/swagger';
import {
  REPORT_REASONS,
  REPORT_STATUSES,
  REPORT_TARGETS,
} from '@wantere/types';

export class ReportCreatedDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: REPORT_STATUSES })
  status!: (typeof REPORT_STATUSES)[number];

  @ApiProperty()
  createdAt!: string;
}

export class ReportDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  reporterId!: string;

  @ApiProperty({ enum: REPORT_TARGETS })
  targetType!: (typeof REPORT_TARGETS)[number];

  @ApiProperty()
  targetId!: string;

  @ApiProperty({ enum: REPORT_REASONS })
  reason!: (typeof REPORT_REASONS)[number];

  @ApiProperty({ nullable: true })
  comment!: string | null;

  @ApiProperty({ enum: REPORT_STATUSES })
  status!: (typeof REPORT_STATUSES)[number];

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  reviewedAt!: string | null;

  @ApiProperty({ nullable: true })
  reviewedBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}
