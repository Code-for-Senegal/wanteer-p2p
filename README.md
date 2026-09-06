# Wantere

Wantere is a community marketplace for buying, selling, giving away and swapping
things locally. It is built for Senegal first, but nothing in the architecture
assumes a single country.

The product is organised around proximity and trust: listings are tied to a
neighbourhood, prices are visible, donations and barter are first-class citizens
next to sales, and moderation is part of the domain rather than an afterthought.

## Status

The foundation is in place: authentication, profiles, categories, listings with
geolocated search, favorites, reports and notifications. Conversations, offers,
orders, group buying and the price observatory are designed for but not
implemented — see [docs/architecture.md](docs/architecture.md).

## Stack

| Area     | Choice                                                       |
| -------- | ------------------------------------------------------------ |
| Monorepo | Turborepo, pnpm workspaces, TypeScript strict                |
| API      | NestJS, PostgreSQL + PostGIS, Prisma, Redis, BullMQ, OpenAPI |
| Web      | Next.js App Router, Tailwind CSS, TanStack Query             |
| Mobile   | Expo, Expo Router, TanStack Query, Zustand                   |
| Admin    | Next.js App Router, Tailwind CSS, TanStack Query             |

## Repository layout

```
apps/
  api/      NestJS modular monolith, source of truth for business rules
  web/      Public website
  mobile/   Expo application
  admin/    Back office
packages/
  api-client/       Fetch client generated from the OpenAPI document
  validation/       Zod schemas shared across clients
  types/            Domain enums and shared primitives
  config/           Product constants (limits, pagination, currencies)
  design-tokens/    Colors, spacing, typography, Tailwind theme
  eslint-config/    Flat ESLint configurations
  typescript-config/
  prettier-config/
docker/     Local Postgres, Redis and MinIO
docs/       Architecture notes
```

## Requirements

- Node.js 22 or later (see `.nvmrc`)
- pnpm 11
- Docker, for Postgres and Redis

## Getting started

```bash
pnpm install
pnpm docker:up

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/mobile/.env.example apps/mobile/.env

pnpm db:migrate
pnpm db:seed
pnpm dev
```

`pnpm dev` starts the API on port 4000, the website on 3000, the back office on
3001 and the Expo bundler. Swagger is served on <http://localhost:4000/docs>
outside production.

## Environment

Every application ships an `.env.example`; no secret is versioned. The API
validates its environment at boot and refuses to start on an invalid one.

| Variable                           | Used by    | Notes                               |
| ---------------------------------- | ---------- | ----------------------------------- |
| `DATABASE_URL`                     | api        | PostgreSQL with PostGIS enabled     |
| `REDIS_URL`                        | api        | Queues, rate limiting, OTP throttle |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | api        | 32 characters minimum               |
| `CORS_ORIGINS`                     | api        | Comma-separated list                |
| `NEXT_PUBLIC_API_URL`              | web, admin | API origin, without the path prefix |
| `EXPO_PUBLIC_API_URL`              | mobile     | API origin, without the path prefix |

## Database

```bash
pnpm db:migrate     # create and apply a migration
pnpm db:seed        # categories used by the applications
pnpm db:studio      # inspect the data
```

PostGIS columns are not representable in the Prisma schema language, so the
geography column is declared as unsupported and filled from the location
service; its GiST index and the full-text indexes live in a hand-written
migration.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @wantere/api test:e2e   # requires Postgres and Redis
pnpm build
```

## API client

The shared client is generated from the API's own OpenAPI document:

```bash
pnpm api:generate
```

This exports `apps/api/openapi.json` and regenerates `@wantere/api-client`. Both
are committed so the applications build without a running API.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Issues and pull requests are welcome.

## License

MIT — see [LICENSE](LICENSE).
