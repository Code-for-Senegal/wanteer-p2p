import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ nullable: true })
  bio!: string | null;

  @ApiProperty({ nullable: true })
  city!: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl!: string | null;
}
