import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';
import { ProfileDto } from './dto/profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@ApiBearerAuth()
@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Read the authenticated profile' })
  @ApiOkResponse({ type: ProfileDto })
  find(@CurrentUser() user: AuthenticatedUser) {
    return this.profiles.find(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the authenticated profile' })
  @ApiOkResponse({ type: ProfileDto })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profiles.update(user.id, dto);
  }
}
