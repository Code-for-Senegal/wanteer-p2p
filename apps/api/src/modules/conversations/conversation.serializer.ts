import { ApiProperty } from '@nestjs/swagger';
import type { ConversationParticipantRole } from '@wantere/types';
import { PageMetaDto } from '../../common/dto/pagination.dto';
import type { PublicMember } from '../users/public-member';

export class MessageView {
  @ApiProperty() id!: string;
  @ApiProperty() conversationId!: string;
  @ApiProperty() senderId!: string;
  @ApiProperty() body!: string;
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
}

export class ConversationParticipantView implements PublicMember {
  @ApiProperty() id!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty({ type: String, nullable: true }) avatarUrl!: string | null;
  @ApiProperty({ format: 'date-time' }) memberSince!: string;
  @ApiProperty({ enum: ['OWNER', 'INTERESTED'] }) role!: ConversationParticipantRole;
}

/** Enough of the listing to label a conversation, without private moderation or location data. */
export class ConversationListingView {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() type!: string;
  @ApiProperty({ type: Number, nullable: true }) price!: number | null;
  @ApiProperty() currency!: string;
  @ApiProperty({ type: String, nullable: true }) coverUrl!: string | null;
}

export class ConversationView {
  @ApiProperty() id!: string;
  @ApiProperty({ type: ConversationListingView }) listing!: ConversationListingView;
  @ApiProperty({ type: [ConversationParticipantView] })
  participants!: ConversationParticipantView[];
  @ApiProperty({ type: MessageView, nullable: true }) lastMessage!: MessageView | null;
  @ApiProperty({ format: 'date-time' }) lastActivityAt!: string;
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
}

export class ConversationPageView {
  @ApiProperty({ type: [ConversationView] }) items!: ConversationView[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
}

export class MessagePageView {
  @ApiProperty({ type: [MessageView] }) items!: MessageView[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
}
