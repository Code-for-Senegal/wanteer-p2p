# P2P Local

P2P Local est une plateforme communautaire pour acheter, vendre, donner et
échanger des biens près de chez soi. Elle est pensée d'abord pour le Sénégal,
mais rien dans son architecture ne suppose un pays unique.

Le produit s'organise autour de la proximité et de la confiance : une annonce est
rattachée à un quartier, les prix sont visibles, le don et le troc sont traités
au même niveau que la vente, et la modération fait partie du domaine métier
plutôt que d'être ajoutée après coup.

`P2P Local` est un nom de code. Il tient la place d'un nom définitif qui reste à
choisir, et il est isolé dans la configuration pour pouvoir être remplacé en une
seule passe.

## État du projet

La V1 est une **application mobile qui fonctionne sans backend** : les annonces
sont enregistrées sur l'appareil, la publication ne demande aucun compte, et la
mise en relation passe par WhatsApp. C'est un socle destiné à être enrichi, pas
une application finie.

L'API existe, elle est testée, et elle **n'est pas consommée par la V1**. Elle
reste versionnée parce que le jour où les annonces devront circuler entre
plusieurs téléphones, c'est elle qui prendra le relais — voir
[docs/architecture.md](docs/architecture.md).

## Stack

| Domaine  | Choix                                                        |
| -------- | ------------------------------------------------------------ |
| Monorepo | Turborepo, pnpm workspaces, TypeScript strict                |
| Mobile   | Expo SDK 57, Expo Router, TanStack Query, Zustand, AsyncStorage |
| API      | NestJS, PostgreSQL + PostGIS, Prisma, Redis, BullMQ, OpenAPI |

## Structure du dépôt

```
apps/
  mobile/   Application Expo — la V1
  api/      Monolithe modulaire NestJS, hors périmètre de la V1
packages/
  api-client/       Client fetch généré depuis le document OpenAPI.
                    Aucune application ne le consomme aujourd'hui ; il est
                    conservé avec l'API dont il est le pendant généré.
  validation/       Schémas Zod partagés
  types/            Enums du domaine et primitives communes
  config/           Constantes produit (limites, pagination, devises, quartiers)
  design-tokens/    Couleurs, espacements, typographie
  eslint-config/    Configurations ESLint flat
  typescript-config/
  prettier-config/
docker/     Postgres, Redis et MinIO en local, pour l'API
docs/       Notes d'architecture et références de conception
```

## Prérequis

- Node.js 24 ou plus récent (voir `.nvmrc`)
- pnpm 11
- Expo Go sur un téléphone, ou un émulateur Android / simulateur iOS
- Docker, uniquement pour travailler sur l'API

## Démarrage

```bash
pnpm install
pnpm --filter @p2p-local/mobile dev
```

Le bundler Expo affiche un QR code ; l'application s'ouvre dans Expo Go. Aucune
variable d'environnement n'est nécessaire : la V1 ne contacte aucun serveur.

### Travailler sur l'API

```bash
cp apps/api/.env.example apps/api/.env

pnpm install
pnpm docker:up

pnpm db:migrate
pnpm db:seed
pnpm --filter @p2p-local/api dev
```

L'API démarre sur le port 4000. Swagger est servi sur
<http://localhost:4000/docs> en dehors de la production.

## Variables d'environnement

L'application mobile n'a aucune variable d'environnement en V1. L'API fournit un
`.env.example` ; aucun secret n'est versionné. Elle valide son environnement au
démarrage et refuse de se lancer s'il est invalide.

| Variable                           | Utilisée par | Remarques                          |
| ---------------------------------- | ------------ | ---------------------------------- |
| `DATABASE_URL`                     | api          | PostgreSQL avec PostGIS activé     |
| `REDIS_URL`                        | api          | Files, rate limiting, throttle OTP |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | api          | 32 caractères minimum              |
| `CORS_ORIGINS`                     | api          | Liste séparée par des virgules     |

## Builds EAS

L'application est liée à un projet EAS. Trois profils sont définis dans
`apps/mobile/eas.json` :

| Profil        | Sortie                   | Usage                                  |
| ------------- | ------------------------ | -------------------------------------- |
| `development` | APK avec client de dév   | développement sur appareil réel        |
| `preview`     | APK, distribution interne | partager une version à tester          |
| `production`  | App Bundle Android        | publication sur le Play Store          |

```bash
cd apps/mobile
npx eas-cli build --platform android --profile preview
```

Le workflow `.github/workflows/eas-build.yml` déclenche un build à la demande.
Il exige un secret de dépôt `EXPO_TOKEN`, créé depuis un jeton d'accès Expo.

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
pnpm --filter @p2p-local/api test:e2e   # nécessite Postgres et Redis
pnpm build
```

Côté mobile, `npx expo-doctor` depuis `apps/mobile` vérifie la cohérence du
projet Expo. Une dépendance Expo s'ajoute toujours avec `npx expo install`.

## Client API

Le client partagé est généré depuis le document OpenAPI de l'API :

```bash
pnpm api:generate
```

Cette commande exporte `apps/api/openapi.json` et régénère
`@p2p-local/api-client`. Les deux sont versionnés pour que les applications
compilent sans API démarrée.

## Contribuer

Lire [CONTRIBUTING.md](CONTRIBUTING.md). Les issues et pull requests sont les
bienvenues.

## Licence

MIT — voir [LICENSE](LICENSE).
