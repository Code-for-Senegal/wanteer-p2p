import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  FavoriteCreatedDto,
  FavoriteItemDto,
} from './dto/favorite-response.dto';
import { FavoritesService } from './favorites.service';

class AddFavoriteDto {
  @ApiProperty()
  @IsUUID()
  listingId!: string;
}

@ApiBearerAuth()
@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'List the favorites of the authenticated member' })
  @ApiPaginatedResponse(FavoriteItemDto)
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.favorites.list(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Add a listing to favorites' })
  @ApiCreatedResponse({ type: FavoriteCreatedDto })
  add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddFavoriteDto) {
    return this.favorites.add(user.id, dto.listingId);
  }

  @Delete(':listingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a listing from favorites' })
  @ApiNoContentResponse()
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listingId', ParseUUIDPipe) listingId: string,
  ) {
    return this.favorites.remove(user.id, listingId);
  }
}
