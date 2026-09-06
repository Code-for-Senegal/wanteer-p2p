import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateListingDto } from './create-listing.dto';

const EDITABLE_STATUSES = ['ACTIVE', 'RESERVED', 'COMPLETED', 'ARCHIVED'] as const;

export class UpdateListingDto extends PartialType(
  PickType(CreateListingDto, [
    'title',
    'description',
    'condition',
    'price',
    'categoryId',
    'latitude',
    'longitude',
    'city',
    'district',
  ] as const),
) {
  @ApiPropertyOptional({ enum: EDITABLE_STATUSES })
  @IsOptional()
  @IsEnum(EDITABLE_STATUSES)
  status?: (typeof EDITABLE_STATUSES)[number];
}
