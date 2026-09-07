/**
 * The only shape of another member the API ever returns inside a resource:
 * no phone, no email, no moderation state, no location. Anything richer goes
 * through `GET /users/:id`, which is scoped on purpose.
 */
export interface PublicMember {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  memberSince: string;
}

export interface PublicMemberSource {
  id: string;
  createdAt: Date;
  profile: { displayName: string; avatarKey: string | null } | null;
}

export function toPublicMember(
  user: PublicMemberSource,
  publicUrl: (storageKey: string) => string,
): PublicMember {
  return {
    id: user.id,
    displayName: user.profile?.displayName ?? 'Membre Wantere',
    avatarUrl: user.profile?.avatarKey ? publicUrl(user.profile.avatarKey) : null,
    memberSince: user.createdAt.toISOString(),
  };
}
