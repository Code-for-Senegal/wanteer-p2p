import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PublicProfileDto } from './dto/public-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Public profile of a member' })
  @ApiOkResponse({ type: PublicProfileDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.publicProfile(id);
  }
}
