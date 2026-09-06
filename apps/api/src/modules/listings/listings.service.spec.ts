import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ListingsService } from './listings.service';
import { ListingSearchRepository } from './listings.repository';
import type { UpdateListingDto } from './dto/update-listing.dto';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { LocationsService } from '../locations/locations.service';

describe('ListingsService', () => {
  const listingId = '3f1a8f0e-0000-4000-8000-000000000010';
  const sellerId = '3f1a8f0e-0000-4000-8000-000000000011';

  const prisma = {
    listing: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: ListingsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ListingSearchRepository, useValue: {} },
        { provide: LocationsService, useValue: { attachToListing: jest.fn() } },
        { provide: StorageService, useValue: { publicUrl: (key: string) => key } },
      ],
    }).compile();

    service = moduleRef.get(ListingsService);
    // `update` reloads the listing at the end; the reload is not what is under test.
    jest.spyOn(service, 'findOne').mockResolvedValue({} as never);
  });

  describe('update', () => {
    it('refuses edits from a member who does not own the listing', async () => {
      prisma.listing.findUnique.mockResolvedValue({ sellerId, type: 'SALE' });

      await expect(
        service.update(listingId, '3f1a8f0e-0000-4000-8000-000000000099', { title: 'Vélo' }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prisma.listing.update).not.toHaveBeenCalled();
    });

    it('refuses to remove the price of a sale', async () => {
      prisma.listing.findUnique.mockResolvedValue({ sellerId, type: 'SALE' });

      // `IsOptional` lets an explicit null through validation, so the DTO type
      // is narrower than what the service actually receives.
      const dto = { price: null } as unknown as UpdateListingDto;

      await expect(service.update(listingId, sellerId, dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(prisma.listing.update).not.toHaveBeenCalled();
    });

    it('applies a new price to a sale', async () => {
      prisma.listing.findUnique.mockResolvedValue({ sellerId, type: 'SALE' });

      await service.update(listingId, sellerId, { price: 7000 });

      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: listingId },
        data: { price: 7000 },
      });
    });

    it('ignores a price sent for a donation', async () => {
      prisma.listing.findUnique.mockResolvedValue({ sellerId, type: 'DONATION' });

      await service.update(listingId, sellerId, { title: 'Cartable à donner', price: 5000 });

      expect(prisma.listing.update).toHaveBeenCalledTimes(1);
      const { data } = prisma.listing.update.mock.calls[0]![0] as { data: Record<string, unknown> };
      expect(data).toEqual({ title: 'Cartable à donner' });
      expect(data).not.toHaveProperty('price');
    });
  });
});
