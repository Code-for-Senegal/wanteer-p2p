# Contributing

## Setup

```bash
pnpm install
pnpm docker:up
cp apps/api/.env.example apps/api/.env
pnpm db:migrate && pnpm db:seed
pnpm dev
```

## Before opening a pull request

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If you touched the API surface, regenerate the shared client and commit the
result:

```bash
pnpm api:generate
```

## Conventions

- Conventional Commits: `feat(api): add offer negotiation`, `fix(web): ...`.
- Code is organised by domain, not by technical layer. A new business concept
  gets its own module under `apps/api/src/modules`.
- NestJS owns the business rules. The web and mobile applications consume the
  API; they do not reimplement validation or authorization.
- Comments explain decisions, constraints or workarounds — not what the code
  already says.
- Public API responses must never expose a member's exact location, phone
  number or internal moderation state.

## Database changes

Update `apps/api/prisma/schema.prisma`, then:

```bash
pnpm db:migrate
```

Anything PostGIS-specific (geography columns, GiST or GIN indexes) belongs in a
hand-written migration, since Prisma cannot express it.

## Tests

- Unit tests live next to the code as `*.spec.ts`.
- End-to-end tests live in `apps/api/test` and run against a real Postgres and
  Redis.

Test what carries risk: authorization, money-adjacent rules, privacy of
locations, search behaviour. Tests asserting that a service is defined are not
useful.
