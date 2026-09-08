import { ApiProperty } from '@nestjs/swagger';

export class FavoriteListingDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  price!: number | null;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ nullable: true })
  coverUrl!: string | null;
}

export class FavoriteItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: FavoriteListingDto })
  listing!: FavoriteListingDto;
}

export class FavoriteCreatedDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  listingId!: string;

  @ApiProperty()
  createdAt!: string;
}
