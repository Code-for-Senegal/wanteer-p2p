import { defineConfig } from 'orval';

export default defineConfig({
  wantere: {
    input: '../../apps/api/openapi.json',
    output: {
      target: './src/generated/wantere.ts',
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
