import { ApiProperty } from '@nestjs/swagger';

export class PublicLocationDto {
  @ApiProperty()
  latitude!: number;

  @ApiProperty()
  longitude!: number;

  @ApiProperty()
  country!: string;

  @ApiProperty({ type: String, nullable: true })
  region!: string | null;

  @ApiProperty({ type: String, nullable: true })
  city!: string | null;

  @ApiProperty({ type: String, nullable: true })
  district!: string | null;

  @ApiProperty()
  displayName!: string;
}

export class ListingMediaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  sortOrder!: number;
}

export class ListingSellerDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl!: string | null;

  @ApiProperty()
  memberSince!: string;
}

export class ListingSummary {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: String, nullable: true })
  condition!: string | null;

  @ApiProperty({ type: Number, nullable: true })
  price!: number | null;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty({ type: String, nullable: true })
  coverUrl!: string | null;

  @ApiProperty({ type: PublicLocationDto, nullable: true })
  location!: PublicLocationDto | null;

  @ApiProperty({ type: Number, nullable: true })
  distanceMeters!: number | null;

  @ApiProperty({ type: String, nullable: true })
  publishedAt!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class ListingDetail extends ListingSummary {
  @ApiProperty()
  description!: string;

  @ApiProperty()
  viewCount!: number;

  @ApiProperty({ type: [ListingMediaDto] })
  media!: ListingMediaDto[];

  @ApiProperty({ type: ListingSellerDto })
  seller!: ListingSellerDto;
}
