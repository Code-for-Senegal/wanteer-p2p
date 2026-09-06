import { Test } from '@nestjs/testing';
import { PUBLIC_LOCATION_PRECISION_DEGREES } from '@wantere/config';
import { LocationsService } from './locations.service';
import { PrismaService } from '../../database/prisma.service';

describe('LocationsService', () => {
  let service: LocationsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [LocationsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = moduleRef.get(LocationsService);
  });

  it('exposes blurred coordinates only', () => {
    const stored = {
      country: 'SN',
      region: null,
      city: 'Dakar',
      district: 'Medina',
      displayName: 'Medina, Dakar',
      publicLatitude: 14.69,
      publicLongitude: -17.45,
    };

    const published = service.toPublic(stored);

    expect(published).not.toHaveProperty('latitude', 14.6928);
    expect(published.latitude).toBe(stored.publicLatitude);
    expect(published.longitude).toBe(stored.publicLongitude);
  });

  it('rounds coordinates to the public grid', () => {
    const precision = PUBLIC_LOCATION_PRECISION_DEGREES;
    expect(Math.round(14.6928 / precision) * precision).toBeCloseTo(14.69, 5);
  });
});
