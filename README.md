# Wantere

Wantere est une plateforme communautaire pour acheter, vendre, donner et
échanger des biens près de chez soi. Elle est pensée d'abord pour le Sénégal,
mais rien dans son architecture ne suppose un pays unique.

Le produit s'organise autour de la proximité et de la confiance : une annonce est
rattachée à un quartier, les prix sont visibles, le don et le troc sont traités
au même niveau que la vente, et la modération fait partie du domaine métier
plutôt que d'être ajoutée après coup.

## État du projet

Les fondations sont en place : authentification, profils, catégories, annonces
avec recherche géolocalisée, favoris, signalements et notifications. Les
conversations, les offres, les commandes, les achats groupés et l'observatoire
des prix sont prévus dans l'architecture mais pas encore implémentés — voir
[docs/architecture.md](docs/architecture.md).

## Stack

| Domaine  | Choix                                                        |
| -------- | ------------------------------------------------------------ |
| Monorepo | Turborepo, pnpm workspaces, TypeScript strict                |
| API      | NestJS, PostgreSQL + PostGIS, Prisma, Redis, BullMQ, OpenAPI |
| Web      | Next.js App Router, Tailwind CSS, TanStack Query             |
| Mobile   | Expo, Expo Router, TanStack Query, Zustand                   |
| Admin    | Next.js App Router, Tailwind CSS, TanStack Query             |

## Structure du dépôt

```
apps/
  api/      Monolithe modulaire NestJS, source de vérité des règles métier
  web/      Site public
  mobile/   Application Expo
  admin/    Back-office
packages/
  api-client/       Client fetch généré depuis le document OpenAPI
  validation/       Schémas Zod partagés entre les clients
  types/            Enums du domaine et primitives communes
  config/           Constantes produit (limites, pagination, devises)
  design-tokens/    Couleurs, espacements, typographie, thème Tailwind
  eslint-config/    Configurations ESLint flat
  typescript-config/
  prettier-config/
docker/     Postgres, Redis et MinIO en local
docs/       Notes d'architecture
```

## Prérequis

- Node.js 22 ou plus récent (voir `.nvmrc`)
- pnpm 11
- Docker, pour Postgres et Redis

## Démarrage

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/mobile/.env.example apps/mobile/.env

pnpm install
pnpm docker:up

pnpm db:migrate
pnpm db:seed
pnpm dev
```

`pnpm dev` démarre l'API sur le port 4000, le site sur 3000, le back-office sur
3001 et le bundler Expo. Swagger est servi sur <http://localhost:4000/docs> en
dehors de la production.

## Variables d'environnement

Chaque application fournit un `.env.example` ; aucun secret n'est versionné.
L'API valide son environnement au démarrage et refuse de se lancer s'il est
invalide.

| Variable                           | Utilisée par | Remarques                          |
| ---------------------------------- | ------------ | ---------------------------------- |
| `DATABASE_URL`                     | api          | PostgreSQL avec PostGIS activé     |
| `REDIS_URL`                        | api          | Files, rate limiting, throttle OTP |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | api          | 32 caractères minimum              |
| `CORS_ORIGINS`                     | api          | Liste séparée par des virgules     |
| `NEXT_PUBLIC_API_URL`              | web, admin   | Origine de l'API, sans le préfixe  |
| `EXPO_PUBLIC_API_URL`              | mobile       | Origine de l'API, sans le préfixe  |

## Base de données

```bash
pnpm db:migrate     # créer et appliquer une migration
pnpm db:seed        # catégories utilisées par les applications
pnpm db:studio      # inspecter les données
```

Les colonnes PostGIS ne sont pas représentables dans le langage de schéma
Prisma : la colonne géographique est donc déclarée comme non supportée et
remplie par le service de localisation ; son index GiST et les index full-text
vivent dans une migration écrite à la main.

## Vérifications

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @wantere/api test:e2e   # nécessite Postgres et Redis
pnpm build
```

## Client API

Le client partagé est généré depuis le document OpenAPI de l'API :

```bash
pnpm api:generate
```

Cette commande exporte `apps/api/openapi.json` et régénère
`@wantere/api-client`. Les deux sont versionnés pour que les applications
compilent sans API démarrée.

## Contribuer

Lire [CONTRIBUTING.md](CONTRIBUTING.md). Les issues et pull requests sont les
bienvenues.

## Licence

MIT — voir [LICENSE](LICENSE).
