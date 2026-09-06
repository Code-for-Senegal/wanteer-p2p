# Architecture

## Shape of the system

One API, three clients. `apps/api` is a NestJS modular monolith and owns every
business rule; `apps/web`, `apps/mobile` and `apps/admin` consume its REST API
through a client generated from its OpenAPI document.

There are no microservices, and there is no second backend hiding in Next.js
server actions. A rule that matters lives in a Nest module, once.

## Why a modular monolith

The product surface is wide — listings, offers, orders, conversations, group
buying, price observation — but the traffic is not. Splitting these into
services now would buy deployment complexity and distributed failure modes in
exchange for nothing. Modules are separated by domain with explicit
dependencies, so extracting one later is a mechanical change rather than a
rewrite.

Modules are grouped by domain (`listings`, `reports`, `notifications`), never by
technical layer. There is no `services/`, `controllers/`, `repositories/` tree at
the root of the source.

## Data

PostgreSQL is the only datastore. Prisma manages the schema and migrations.

PostGIS handles proximity. Prisma cannot type a `geography` column, so
`locations.geom` is declared as unsupported, written from `LocationsService`
alongside the plain latitude/longitude, and queried through raw SQL for radius
and distance ordering. The GiST index and the full-text indexes are created in a
hand-written migration.

Search is Postgres: `to_tsvector` for the text, `pg_trgm` for approximate
matches, PostGIS for the radius. No external engine. `ListingSearchRepository`
is the only place that knows SQL, which is what makes a move to Typesense or
Meilisearch a contained change.

## Location privacy

A listing stores two points: the exact one, which stays internal, and a public
one snapped to a coarse grid (about a kilometre). The API only ever serialises
the public one, together with the district and city labels. This is enforced in
`LocationsService.toPublic`, and covered by an end-to-end test.

## Authentication

Phone number plus one-time code. The API issues a short-lived access token and a
rotating refresh token; each refresh creates a new session, revokes the previous
one and links them. Replaying a consumed refresh token revokes every session of
that account.

Sessions, devices and phone verifications are first-class tables, so a member can
list and revoke their sessions later, and so identity verification can be added
without reshaping the model.

Authentication stays inside the product. No external identity provider, no OAuth
server: the audience is people signing in with a phone number.

## Redis and background work

Redis backs BullMQ, rate limiting and OTP throttling. It is not a cache in front
of the database — entities are read from Postgres.

Four queues, by nature of the work rather than by feature: `notifications`,
`media`, `indexing`, `system`.

## Notifications

Notifications are persisted first and delivered asynchronously. The in-app feed
therefore never depends on a delivery provider being reachable, and adding push
or email later means adding a processor, not changing the callers.

## Designed for, not implemented

These domains have a place in the architecture and no code yet:

- **Conversations and messages** — `Conversation`, `ConversationParticipant`,
  `Message`, `MessageAttachment`; realtime through Socket.IO with a Redis
  adapter when scaling requires it.
- **Offers** — a buyer proposes a price, the seller accepts, refuses or counters
  (`PENDING`, `ACCEPTED`, `REJECTED`, `COUNTERED`, `EXPIRED`, `CANCELLED`).
- **Orders, delivery, payments** — hand-to-hand exchange comes first; delivery
  and escrowed payment are later additions on top of an accepted offer.
- **Reviews and reputation** — ratings on both sides of a completed exchange.
- **Group buying** — `GroupBuy`, `GroupBuyParticipant`, `GroupBuyItem`, with a
  minimum quantity, a deadline and a zone.
- **Price observatory** — `PriceObservation`, `ProductReference`,
  `MerchantLocation`, to compare prices by neighbourhood and over time.
- **Professional accounts** — storefronts, subscriptions, boosted listings.

Campaigns (`Campaign`) exist in the schema and are deliberately thin: a campaign
is a time-boxed editorial wrapper, never a special code path in the core
domains.

## Deliberate omissions

- No Clean Architecture ceremony, no CQRS, no event sourcing.
- No generic repository, no base service, no interface per service.
- No shared UI component library between React Native and the web: they share
  tokens, not components.
- No pricing or monetisation logic.
