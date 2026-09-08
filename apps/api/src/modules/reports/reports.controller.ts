import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportCreatedDto, ReportDto } from './dto/report-response.dto';
import { ReportsService } from './reports.service';

class ReviewReportDto {
  @ApiProperty({ enum: ['RESOLVED', 'DISMISSED'] })
  @IsIn(['RESOLVED', 'DISMISSED'])
  status!: 'RESOLVED' | 'DISMISSED';
}

@ApiBearerAuth()
@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Report a member or a listing' })
  @ApiCreatedResponse({ type: ReportCreatedDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReportDto,
  ) {
    return this.reports.create(user.id, dto);
  }

  @Roles('MODERATOR', 'ADMIN')
  @Get()
  @ApiOperation({ summary: 'Moderation queue' })
  @ApiPaginatedResponse(ReportDto)
  list(@Query() query: PaginationQueryDto) {
    return this.reports.list(query);
  }

  @Roles('MODERATOR', 'ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Close a report' })
  @ApiOkResponse({ type: ReportDto })
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReviewReportDto,
  ) {
    return this.reports.review(id, user.id, dto.status);
  }
}
