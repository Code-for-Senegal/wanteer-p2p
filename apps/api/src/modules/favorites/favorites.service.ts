import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { paginate, type PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async add(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, status: { in: ['ACTIVE', 'RESERVED'] } },
      select: { id: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const favorite = await this.prisma.favorite.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: { userId, listingId },
      update: {},
    });

    return { id: favorite.id, listingId, createdAt: favorite.createdAt.toISOString() };
  }

  async remove(userId: string, listingId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId, listingId } });
  }

  async list(userId: string, query: PaginationQueryDto) {
    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.pageSize,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              currency: true,
              status: true,
              media: { orderBy: { sortOrder: 'asc' }, take: 1, select: { storageKey: true } },
            },
          },
        },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    const items = favorites.map((favorite) => ({
      id: favorite.id,
      createdAt: favorite.createdAt.toISOString(),
      listing: {
        id: favorite.listing.id,
        title: favorite.listing.title,
        price: favorite.listing.price,
        currency: favorite.listing.currency,
        status: favorite.listing.status,
        coverUrl: favorite.listing.media[0]
          ? this.storage.publicUrl(favorite.listing.media[0].storageKey)
          : null,
      },
    }));

    return paginate(items, total, query);
  }
}
