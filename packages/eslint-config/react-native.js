import { base } from './base.js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(...base, {
  files: ['**/*.{ts,tsx}'],
  plugins: { 'react-hooks': reactHooks },
  languageOptions: {
    globals: { __DEV__: 'readonly', fetch: 'readonly', console: 'readonly' },
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
  },
});
