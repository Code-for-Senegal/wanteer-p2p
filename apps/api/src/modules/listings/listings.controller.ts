import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { SearchListingsDto } from './dto/search-listings.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingDetail, ListingSummary } from './listing.serializer';
import { ListingsService } from './listings.service';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search active listings' })
  @ApiPaginatedResponse(ListingSummary)
  findMany(@Query() query: SearchListingsDto) {
    return this.listings.findMany(query);
  }

  @ApiBearerAuth()
  @Get('mine')
  @ApiOperation({ summary: 'Listings owned by the authenticated member' })
  @ApiPaginatedResponse(ListingSummary)
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.listings.findBySeller(user.id, query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Listing detail' })
  @ApiOkResponse({ type: ListingDetail })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const listing = await this.listings.findOne(id);
    await this.listings.registerView(id);
    return listing;
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Publish a listing' })
  @ApiCreatedResponse({ type: ListingDetail })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateListingDto,
  ) {
    return this.listings.create(user.id, dto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update an owned listing' })
  @ApiOkResponse({ type: ListingDetail })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listings.update(id, user.id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive an owned listing' })
  @ApiNoContentResponse()
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.listings.archive(id, user.id);
  }
}
