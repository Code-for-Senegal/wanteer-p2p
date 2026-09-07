import { defineConfig } from 'orval';

export default defineConfig({
  wantere: {
    input: '../../apps/api/openapi.json',
    output: {
      target: './src/generated/wantere.ts',
      schemas: './src/generated/models',
      client: 'fetch',
      mode: 'split',
      clean: true,
      baseUrl: '',
      prettier: true,
      override: {
        tags: {
          conversations: {
            // The shared request mutator returns the parsed body directly.
            fetch: { includeHttpResponseReturnType: false },
          },
        },
        mutator: {
          path: './src/http-client.ts',
          name: 'request',
        },
      },
    },
  },
});
