import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async find(userId: string) {
    const profile = await this.prisma.profile.findUniqueOrThrow({ where: { userId } });
    return this.serialize(profile);
  }

  async update(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.update({ where: { userId }, data: dto });
    return this.serialize(profile);
  }

  private serialize(profile: {
    id: string;
    displayName: string;
    bio: string | null;
    city: string | null;
    avatarKey: string | null;
  }) {
    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio,
      city: profile.city,
      avatarUrl: profile.avatarKey ? this.storage.publicUrl(profile.avatarKey) : null,
    };
  }
}
