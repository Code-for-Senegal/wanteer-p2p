import { Injectable } from '@nestjs/common';
import { DEFAULT_COUNTRY, PUBLIC_LOCATION_PRECISION_DEGREES } from '@wantere/config';
import type { PublicLocation } from '@wantere/types';
import { PrismaService } from '../../database/prisma.service';

export interface LocationInput {
  latitude: number;
  longitude: number;
  country?: string;
  region?: string | null;
  city?: string | null;
  district?: string | null;
}

interface StoredLocation {
  country: string;
  region: string | null;
  city: string | null;
  district: string | null;
  displayName: string;
  publicLatitude: number;
  publicLongitude: number;
}

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Writes the exact point for internal use and the blurred one for the public
   * API, then fills the PostGIS column which Prisma cannot type.
   */
  async attachToListing(listingId: string, input: LocationInput): Promise<void> {
    const country = input.country ?? DEFAULT_COUNTRY;
    const publicLatitude = blur(input.latitude);
    const publicLongitude = blur(input.longitude);
    const displayName =
      [input.district, input.city, input.region].filter(Boolean).join(', ') || country;

    await this.prisma.location.upsert({
      where: { listingId },
      create: {
        listingId,
        country,
        region: input.region ?? null,
        city: input.city ?? null,
        district: input.district ?? null,
        displayName,
        latitude: input.latitude,
        longitude: input.longitude,
        publicLatitude,
        publicLongitude,
      },
      update: {
        country,
        region: input.region ?? null,
        city: input.city ?? null,
        district: input.district ?? null,
        displayName,
        latitude: input.latitude,
        longitude: input.longitude,
        publicLatitude,
        publicLongitude,
      },
    });

    await this.prisma.$executeRaw`
      UPDATE locations
      SET geom = ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography
      WHERE "listingId" = ${listingId}::uuid
    `;
  }

  /** Listing ids within `radiusMeters`, closest first. */
  async listingIdsWithin(
    latitude: number,
    longitude: number,
    radiusMeters: number,
    limit: number,
  ): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ listingId: string }[]>`
      SELECT "listingId"
      FROM locations
      WHERE geom IS NOT NULL
        AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, ${radiusMeters})
      ORDER BY geom <-> ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      LIMIT ${limit}
    `;

    return rows.map((row) => row.listingId);
  }

  toPublic(location: StoredLocation): PublicLocation {
    return {
      latitude: location.publicLatitude,
      longitude: location.publicLongitude,
      country: location.country,
      region: location.region,
      city: location.city,
      district: location.district,
      displayName: location.displayName,
    };
  }
}

function blur(value: number): number {
  const precision = PUBLIC_LOCATION_PRECISION_DEGREES;
  return Math.round(value / precision) * precision;
}
