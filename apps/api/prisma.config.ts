/// <reference types="node" />
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Prefer process.env over env(): env() throws if unset, which breaks
    // `prisma generate` on postinstall before apps/api/.env exists.
    url: process.env['DATABASE_URL'],
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});
