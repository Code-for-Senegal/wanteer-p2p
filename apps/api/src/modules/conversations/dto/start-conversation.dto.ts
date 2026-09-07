import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class StartConversationDto {
  @ApiProperty({ description: 'Listing the member wants to talk about' })
  @IsUUID()
  listingId!: string;
}
