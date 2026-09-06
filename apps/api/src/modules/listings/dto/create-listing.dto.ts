import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { LISTING_LIMITS } from '@wantere/config';
import { LISTING_CONDITIONS, LISTING_TYPES } from '@wantere/types';

export class CreateListingDto {
  @ApiProperty()
  @IsString()
  @Length(LISTING_LIMITS.titleMin, LISTING_LIMITS.titleMax)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(LISTING_LIMITS.descriptionMax)
  description!: string;

  @ApiProperty({ enum: LISTING_TYPES })
  @IsEnum(LISTING_TYPES)
  type!: (typeof LISTING_TYPES)[number];

  @ApiPropertyOptional({ enum: LISTING_CONDITIONS })
  @IsOptional()
  @IsEnum(LISTING_CONDITIONS)
  condition?: (typeof LISTING_CONDITIONS)[number];

  @ApiPropertyOptional({ description: 'Required for a sale, in minor-free XOF units' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(LISTING_LIMITS.maxPrice)
  price?: number;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 14.6928 })
  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: -17.4467 })
  @Type(() => Number)
  @IsLongitude()
  longitude!: number;

  @ApiPropertyOptional({ example: 'Dakar' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({ example: 'Medina' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  district?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(LISTING_LIMITS.maxMedia)
  mediaKeys?: string[];
}
