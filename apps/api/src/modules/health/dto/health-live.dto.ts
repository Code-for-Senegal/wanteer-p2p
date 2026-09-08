import { ApiProperty } from '@nestjs/swagger';

export class HealthLiveDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty()
  uptime!: number;
}
