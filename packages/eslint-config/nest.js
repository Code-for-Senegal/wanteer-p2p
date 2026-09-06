import { base } from './base.js';
import tseslint from 'typescript-eslint';

export default tseslint.config(...base, {
  files: ['**/*.ts'],
  rules: {
    // Nest resolves constructor dependencies from runtime metadata: a service
    // imported with `import type` disappears from the emitted code.
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
});
