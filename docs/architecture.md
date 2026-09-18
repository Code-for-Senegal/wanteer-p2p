# Architecture

## V1: a local-first mobile application

The V1 is `apps/mobile`, an Expo application that runs without a backend.
Listings are written to the device, publishing asks for no account, and putting
two people in touch is delegated to WhatsApp.

This is a starting point, not an end state. It exists to get the product in
front of a neighbourhood quickly, and it carries one heavy consequence that must
stay visible: **a listing published on a device is not visible on any other
device.** Sharing is what circulates a listing, not a feed.

### The seam that makes it reversible

Every read and write goes through `ListingRepository`, an interface in
`apps/mobile/features/listings`. Its only implementation in V1 stores a JSON
document in AsyncStorage. Three rules keep the seam useful:

- every method is asynchronous, even those that would not need to be, so an HTTP
  implementation substitutes without changing a signature;
- filtering happens in the repository, never in a screen, because a filter is a
  query string once a server answers;
- no screen imports AsyncStorage. The repository is injected through a React
  context, so switching to the API is one class and one line in the provider.

### Listing ownership without accounts

A listing carries an `ownerKey` generated at publication. Today the storage is
already private to the device, so the key buys nothing — it is written now so
that access control exists in the model and in the UI before a server needs it.

Listings expire on their own after a fixed number of days, and completing one
keeps it visible, greyed out, for 48 hours before it is archived. Deleting one
removes its photo file as well.

### Phone numbers

The application never renders a phone number. It builds a `wa.me` link at the
moment of the tap, with a message that names the listing so the recipient can
tell where the contact comes from. A shared listing carries its title, its type
and its district — never a number.

### What comes next

A backend restores what local-first cannot do: listings visible to others, an
administration link that works from another screen, and light authentication.
The section below describes the API that already exists for that purpose.

## Backend, out of scope for the V1

The code described from here on is implemented and tested in `apps/api`. **No
client consumes it today.** It is kept because it is where the product goes once
listings need to travel between phones.

## Shape of the system

`apps/api` is a NestJS modular monolith and owns every business rule. Clients
consume its REST API through a client generated from its OpenAPI document.

There are no microservices, and there is no second backend hiding in a server
framework. A rule that matters lives in a Nest module, once.

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
- No shared UI component library: the design tokens are shared, components are
  not.
- No pricing or monetisation logic.
