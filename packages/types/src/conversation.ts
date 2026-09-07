export const CONVERSATION_PARTICIPANT_ROLES = ['OWNER', 'INTERESTED'] as const;
export type ConversationParticipantRole = (typeof CONVERSATION_PARTICIPANT_ROLES)[number];
