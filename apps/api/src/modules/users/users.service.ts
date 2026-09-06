import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /** Public view of an account: no phone number, no email, no moderation state. */
  async publicProfile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, status: 'ACTIVE' },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeListings = await this.prisma.listing.count({
      where: { sellerId: user.id, status: 'ACTIVE' },
    });

    return {
      id: user.id,
      displayName: user.profile?.displayName ?? 'Membre Wantere',
      bio: user.profile?.bio ?? null,
      city: user.profile?.city ?? null,
      avatarUrl: user.profile?.avatarKey ? this.storage.publicUrl(user.profile.avatarKey) : null,
      memberSince: user.createdAt.toISOString(),
      activeListings,
    };
  }
}
