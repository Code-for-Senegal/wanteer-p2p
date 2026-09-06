import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import type { SearchListingsDto } from './dto/search-listings.dto';

interface SearchRow {
  id: string;
  distance: number | null;
  total: bigint;
}

export interface SearchResult {
  ids: string[];
  total: number;
  distances: Map<string, number>;
}

/**
 * Search runs as a single SQL statement: Postgres full-text and trigram matching
 * for the text part, PostGIS for proximity. The service layer never sees SQL,
 * which keeps the door open for an external search engine later on.
 */
@Injectable()
export class ListingSearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchListingsDto): Promise<SearchResult> {
    const filters: Prisma.Sql[] = [Prisma.sql`l.status = 'ACTIVE'::"ListingStatus"`];

    if (query.type) {
      filters.push(Prisma.sql`l.type = ${query.type}::"ListingType"`);
    }
    if (query.condition) {
      filters.push(Prisma.sql`l.condition = ${query.condition}::"ListingCondition"`);
    }
    if (query.categoryId) {
      filters.push(Prisma.sql`l."categoryId" = ${query.categoryId}::uuid`);
    }
    if (typeof query.minPrice === 'number') {
      filters.push(Prisma.sql`l.price >= ${query.minPrice}`);
    }
    if (typeof query.maxPrice === 'number') {
      filters.push(Prisma.sql`l.price <= ${query.maxPrice}`);
    }

    const term = query.q?.trim();
    if (term) {
      filters.push(Prisma.sql`(
        to_tsvector('french', l.title || ' ' || l.description) @@ plainto_tsquery('french', ${term})
        OR l.title % ${term}
      )`);
    }

    const hasPoint = typeof query.latitude === 'number' && typeof query.longitude === 'number';
    const reference = hasPoint
      ? Prisma.sql`ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography`
      : null;

    if (reference) {
      filters.push(
        Prisma.sql`loc.geom IS NOT NULL AND ST_DWithin(loc.geom, ${reference}, ${query.radius ?? 5000})`,
      );
    }

    const distance = reference
      ? Prisma.sql`ST_Distance(loc.geom, ${reference})`
      : Prisma.sql`NULL::double precision`;

    const rows = await this.prisma.$queryRaw<SearchRow[]>`
      SELECT l.id,
             ${distance} AS distance,
             COUNT(*) OVER() AS total
      FROM listings l
      LEFT JOIN locations loc ON loc."listingId" = l.id
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY ${this.orderBy(query, term, reference)}
      LIMIT ${query.pageSize} OFFSET ${query.skip}
    `;

    return {
      ids: rows.map((row) => row.id),
      total: rows.length > 0 ? Number(rows[0]!.total) : 0,
      distances: new Map(
        rows
          .filter((row) => row.distance !== null)
          .map((row) => [row.id, Math.round(row.distance!)]),
      ),
    };
  }

  private orderBy(
    query: SearchListingsDto,
    term: string | undefined,
    reference: Prisma.Sql | null,
  ) {
    if (query.sort === 'price_asc') {
      return Prisma.sql`l.price ASC NULLS LAST, l."publishedAt" DESC`;
    }
    if (query.sort === 'price_desc') {
      return Prisma.sql`l.price DESC NULLS LAST, l."publishedAt" DESC`;
    }
    if (query.sort === 'distance' && reference) {
      return Prisma.sql`ST_Distance(loc.geom, ${reference}) ASC`;
    }
    if (term) {
      return Prisma.sql`
        ts_rank(to_tsvector('french', l.title || ' ' || l.description), plainto_tsquery('french', ${term})) DESC,
        l."publishedAt" DESC NULLS LAST`;
    }
    return Prisma.sql`l."publishedAt" DESC NULLS LAST, l."createdAt" DESC`;
  }
}
