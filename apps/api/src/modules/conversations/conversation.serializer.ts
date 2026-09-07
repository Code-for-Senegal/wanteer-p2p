import type { ConversationParticipantRole } from '@wantere/types';
import type { PublicMember } from '../users/public-member';

export interface MessageView {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface ConversationParticipantView extends PublicMember {
  role: ConversationParticipantRole;
}

/** Enough of the listing to label a conversation. Location is deliberately absent. */
export interface ConversationListingView {
  id: string;
  title: string;
  type: string;
  status: string;
  price: number | null;
  currency: string;
  coverUrl: string | null;
}

export interface ConversationView {
  id: string;
  listing: ConversationListingView;
  participants: ConversationParticipantView[];
  lastMessage: MessageView | null;
  lastActivityAt: string;
  createdAt: string;
}
