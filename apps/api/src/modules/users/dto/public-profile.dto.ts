import { ApiProperty } from '@nestjs/swagger';

export class PublicProfileDto {
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

  @ApiProperty()
  memberSince!: string;

  @ApiProperty()
  activeListings!: number;
}
