import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ConversationsService } from './conversations.service';
import { SendMessageDto } from './dto/send-message.dto';
import { StartConversationDto } from './dto/start-conversation.dto';

@ApiBearerAuth()
@ApiTags('conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Start a conversation about a listing, or return the existing one',
    description:
      'One conversation exists per listing and interested member. Opening requires an ACTIVE listing owned by someone else; an existing conversation is returned as-is.',
  })
  start(@CurrentUser() user: AuthenticatedUser, @Body() dto: StartConversationDto) {
    return this.conversations.startOrReuse(user.id, dto.listingId);
  }

  @Get()
  @ApiOperation({ summary: 'Conversations the authenticated member takes part in' })
  findMine(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.conversations.findForMember(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Conversation detail, participants only' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.conversations.findOne(id, user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Messages of a conversation, newest first, participants only' })
  findMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.conversations.findMessages(id, user.id, query);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a text message, participants only' })
  sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversations.sendMessage(id, user.id, dto.body);
  }
}
