import { defineConfig } from 'orval';

export default defineConfig({
  'p2p-local': {
    input: '../../apps/api/openapi.json',
    output: {
      target: './src/generated/p2p-local.ts',
      schemas: './src/generated/models',
      client: 'fetch',
      mode: 'split',
      baseUrl: '',
      prettier: true,
      override: {
        mutator: {
          path: './src/http-client.ts',
          name: 'request',
        },
      },
    },
  },
});
