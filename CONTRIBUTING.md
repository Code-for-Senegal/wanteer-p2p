# Contributing

## Setup

```bash
pnpm install
pnpm --filter @p2p-local/mobile dev
```

The V1 mobile application needs nothing else: no server, no environment
variable. To work on the API:

```bash
cp apps/api/.env.example apps/api/.env
pnpm docker:up
pnpm db:migrate && pnpm db:seed
pnpm --filter @p2p-local/api dev
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

- Conventional Commits: `feat(mobile): add the district picker`, `fix(api): ...`.
- Code is organised by domain, not by technical layer. A new business concept
  gets its own module under `apps/api/src/modules`, or its own folder under
  `apps/mobile/features`.
- The V1 mobile app has no backend. Listings live on the device behind
  `ListingRepository`; screens never touch AsyncStorage directly. Every read and
  write goes through the repository interface, so a server implementation can
  replace it without rewriting a screen.
- The API owns the business rules for anything it serves. Clients consume it;
  they do not reimplement validation or authorization.
- Comments explain decisions, constraints or workarounds — not what the code
  already says.
- Public API responses must never expose a member's exact location, phone
  number or internal moderation state.

  This rule covers the API. The mobile app does not display a phone number
  either: it only builds a `wa.me` link at the moment of the tap. That the
  author of a listing becomes reachable at all is a contradiction with the
  promise made during framing, and it is an open team decision — see
  [docs/design/README.md](docs/design/README.md).

## Mobile application

- Add an Expo dependency with `npx expo install <package>`, never with a version
  written by hand: only `expo install` knows what the SDK is compatible with.
  `npx expo install --check` reports drift, `--fix` corrects it.
- `npx expo-doctor` must pass before opening a pull request.
- Application icons are generated: edit `apps/mobile/assets/source/*.svg`, run
  `pnpm --filter @p2p-local/mobile assets:build`, and commit the resulting PNGs.

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
- On mobile, pure functions (formatting, WhatsApp links) and the storage
  repository are tested. Screen rendering is not tested in V1.

Test what carries risk: authorization, money-adjacent rules, privacy of
locations and phone numbers, search behaviour. Tests asserting that a service is
defined are not useful.
