import { ApiProperty } from '@nestjs/swagger';

export class CategoryNode {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  icon!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty({ type: () => [CategoryNode] })
  children!: CategoryNode[];
}

export class CategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  parentId!: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  icon!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  active!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}

export class CategoryDetailDto extends CategoryDto {
  @ApiProperty({ type: [CategoryDto] })
  children!: CategoryDto[];
}
