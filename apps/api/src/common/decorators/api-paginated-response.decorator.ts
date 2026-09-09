import { applyDecorators, type Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { PageMetaDto } from '../dto/pagination.dto';

export function ApiPaginatedResponse<TModel extends Type<unknown>>(
  model: TModel,
) {
  class PaginatedHost {
    @ApiProperty({ type: () => [model] })
    items!: InstanceType<TModel>[];

    @ApiProperty({ type: PageMetaDto })
    meta!: PageMetaDto;
  }

  Object.defineProperty(PaginatedHost, 'name', {
    value: `Paginated${model.name.replace(/Dto$/, '')}Dto`,
  });

  return applyDecorators(
    ApiExtraModels(PageMetaDto, model, PaginatedHost),
    ApiOkResponse({ type: PaginatedHost }),
  );
}
