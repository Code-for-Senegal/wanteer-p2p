-- Proximity lookups on the PostGIS column Prisma cannot describe.
CREATE INDEX "locations_geom_idx" ON "locations" USING GIST ("geom");

-- Full-text search over the listing text, plus trigram matching so misspelled
-- queries still return something useful.
CREATE INDEX "listings_search_idx" ON "listings"
  USING GIN (to_tsvector('french', "title" || ' ' || "description"));

CREATE INDEX "listings_title_trgm_idx" ON "listings" USING GIN ("title" gin_trgm_ops);
