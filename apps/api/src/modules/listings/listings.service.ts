import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DEFAULT_CURRENCY } from '@wantere/config';
import { requiresPrice } from '@wantere/types';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { LocationsService } from '../locations/locations.service';
import { paginate, type PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ListingSearchRepository } from './listings.repository';
import type { CreateListingDto } from './dto/create-listing.dto';
import type { SearchListingsDto } from './dto/search-listings.dto';
import type { UpdateListingDto } from './dto/update-listing.dto';
import type { ListingDetail, ListingSummary } from './listing.serializer';

const summarySelect = {
  id: true,
  title: true,
  type: true,
  status: true,
  condition: true,
  price: true,
  currency: true,
  categoryId: true,
  publishedAt: true,
  createdAt: true,
  media: { orderBy: { sortOrder: 'asc' }, take: 1, select: { storageKey: true } },
  location: true,
} as const;

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly search: ListingSearchRepository,
    private readonly locations: LocationsService,
    private readonly storage: StorageService,
  ) {}

  async create(sellerId: string, dto: CreateListingDto): Promise<ListingDetail> {
    if (requiresPrice(dto.type) && typeof dto.price !== 'number') {
      throw new BadRequestException('A price is required for a sale');
    }

    const listing = await this.prisma.listing.create({
      data: {
        sellerId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        condition: dto.condition ?? null,
        price: requiresPrice(dto.type) ? (dto.price ?? null) : null,
        currency: DEFAULT_CURRENCY,
        status: 'ACTIVE',
        publishedAt: new Date(),
        media: {
          create: (dto.mediaKeys ?? []).map((storageKey, index) => ({
            storageKey,
            mimeType: 'image/jpeg',
            size: 0,
            sortOrder: index,
          })),
        },
      },
    });

    await this.locations.attachToListing(listing.id, {
      latitude: dto.latitude,
      longitude: dto.longitude,
      city: dto.city ?? null,
      district: dto.district ?? null,
    });

    return this.findOne(listing.id);
  }

  async findMany(query: SearchListingsDto) {
    const { ids, total, distances } = await this.search.search(query);

    if (ids.length === 0) {
      return paginate<ListingSummary>([], 0, query);
    }

    const listings = await this.prisma.listing.findMany({
      where: { id: { in: ids } },
      select: summarySelect,
    });

    const byId = new Map(listings.map((listing) => [listing.id, listing]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing))
      .map((listing) => this.toSummary(listing, distances.get(listing.id) ?? null));

    return paginate(ordered, total, query);
  }

  async findBySeller(sellerId: string, query: PaginationQueryDto) {
    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { sellerId },
        select: summarySelect,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.listing.count({ where: { sellerId } }),
    ]);

    return paginate(
      listings.map((listing) => this.toSummary(listing, null)),
      total,
      query,
    );
  }

  async findOne(id: string): Promise<ListingDetail> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        location: true,
        media: { orderBy: { sortOrder: 'asc' } },
        seller: { include: { profile: true } },
      },
    });

    if (!listing || listing.status === 'REJECTED') {
      throw new NotFoundException('Listing not found');
    }

    return {
      ...this.toSummary(listing, null),
      description: listing.description,
      viewCount: listing.viewCount,
      media: listing.media.map((media) => ({
        id: media.id,
        url: this.storage.publicUrl(media.storageKey),
        sortOrder: media.sortOrder,
      })),
      seller: {
        id: listing.seller.id,
        displayName: listing.seller.profile?.displayName ?? 'Membre Wantere',
        avatarUrl: listing.seller.profile?.avatarKey
          ? this.storage.publicUrl(listing.seller.profile.avatarKey)
          : null,
        memberSince: listing.seller.createdAt.toISOString(),
      },
    };
  }

  async update(id: string, userId: string, dto: UpdateListingDto): Promise<ListingDetail> {
    await this.assertOwnership(id, userId);

    const { latitude, longitude, city, district, ...fields } = dto;

    await this.prisma.listing.update({ where: { id }, data: fields });

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      await this.locations.attachToListing(id, {
        latitude,
        longitude,
        city: city ?? null,
        district: district ?? null,
      });
    }

    return this.findOne(id);
  }

  async archive(id: string, userId: string): Promise<void> {
    await this.assertOwnership(id, userId);
    await this.prisma.listing.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  async registerView(id: string): Promise<void> {
    await this.prisma.listing.updateMany({
      where: { id, status: 'ACTIVE' },
      data: { viewCount: { increment: 1 } },
    });
  }

  private async assertOwnership(id: string, userId: string): Promise<void> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException('This listing belongs to another member');
    }
  }

  private toSummary(
    listing: {
      id: string;
      title: string;
      type: string;
      status: string;
      condition: string | null;
      price: number | null;
      currency: string;
      categoryId: string;
      publishedAt: Date | null;
      createdAt: Date;
      media: { storageKey: string }[];
      location: Parameters<LocationsService['toPublic']>[0] | null;
    },
    distanceMeters: number | null,
  ): ListingSummary {
    return {
      id: listing.id,
      title: listing.title,
      type: listing.type,
      status: listing.status,
      condition: listing.condition,
      price: listing.price,
      currency: listing.currency,
      categoryId: listing.categoryId,
      coverUrl: listing.media[0] ? this.storage.publicUrl(listing.media[0].storageKey) : null,
      location: listing.location ? this.locations.toPublic(listing.location) : null,
      distanceMeters,
      publishedAt: listing.publishedAt?.toISOString() ?? null,
      createdAt: listing.createdAt.toISOString(),
    };
  }
}
