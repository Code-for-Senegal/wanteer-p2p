import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { MESSAGE_LIMITS } from '@wantere/config';

export class SendMessageDto {
  @ApiProperty({ minLength: 1, maxLength: MESSAGE_LIMITS.bodyMax })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, MESSAGE_LIMITS.bodyMax)
  body!: string;
}
