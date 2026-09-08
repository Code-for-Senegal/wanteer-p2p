import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HealthIndicatorStatusDto {
  @ApiProperty({ enum: ['up', 'degraded', 'down'] })
  status!: string;
}

export class HealthIndicatorsDto {
  @ApiProperty({ type: HealthIndicatorStatusDto })
  database!: HealthIndicatorStatusDto;

  @ApiProperty({ type: HealthIndicatorStatusDto })
  redis!: HealthIndicatorStatusDto;
}

export class HealthReadyDto {
  @ApiProperty({ enum: ['ok', 'error', 'degraded', 'shutting_down'] })
  status!: string;

  @ApiPropertyOptional({ type: HealthIndicatorsDto, nullable: true })
  info?: HealthIndicatorsDto | null;

  @ApiPropertyOptional({ type: HealthIndicatorsDto, nullable: true })
  error?: HealthIndicatorsDto | null;

  @ApiProperty({ type: HealthIndicatorsDto })
  details!: HealthIndicatorsDto;
}
