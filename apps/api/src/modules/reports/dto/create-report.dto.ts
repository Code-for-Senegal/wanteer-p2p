import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { REPORT_REASONS, REPORT_TARGETS } from '@wantere/types';

export class CreateReportDto {
  @ApiProperty({ enum: REPORT_TARGETS })
  @IsEnum(REPORT_TARGETS)
  targetType!: (typeof REPORT_TARGETS)[number];

  @ApiProperty()
  @IsUUID()
  targetId!: string;

  @ApiProperty({ enum: REPORT_REASONS })
  @IsEnum(REPORT_REASONS)
  reason!: (typeof REPORT_REASONS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
