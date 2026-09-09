import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import {
  AuthTokensDto,
  LoginDto,
  OtpChallengeDto,
  RefreshDto,
  RegisterDto,
  SessionUserDto,
  VerifyOtpDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Create an account and send a verification code' })
  @ApiOkResponse({ type: OtpChallengeDto })
  register(@Body() dto: RegisterDto): Promise<OtpChallengeDto> {
    return this.auth.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a verification code to an existing account' })
  @ApiOkResponse({ type: OtpChallengeDto })
  login(@Body() dto: LoginDto): Promise<OtpChallengeDto> {
    return this.auth.login(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a verification code for a session' })
  @ApiOkResponse({ type: AuthTokensDto })
  verify(@Body() dto: VerifyOtpDto, @Req() request: Request): Promise<AuthTokensDto> {
    return this.auth.verify(dto, {
      userAgent: request.headers['user-agent'] ?? null,
      ipAddress: request.ip ?? null,
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate a refresh token' })
  @ApiOkResponse({ type: AuthTokensDto })
  refresh(@Body() dto: RefreshDto): Promise<AuthTokensDto> {
    return this.auth.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current session' })
  @ApiNoContentResponse()
  logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    return this.auth.logout(user.sessionId);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated account' })
  @ApiOkResponse({ type: SessionUserDto })
  me(@CurrentUser() user: AuthenticatedUser): Promise<SessionUserDto> {
    return this.auth.me(user.id);
  }
}
