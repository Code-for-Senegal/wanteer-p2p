import { base } from './base.js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import next from '@next/eslint-plugin-next';
import globals from 'globals';

export default tseslint.config(...base, {
  files: ['**/*.{ts,tsx}'],
  plugins: { 'react-hooks': reactHooks, '@next/next': next },
  languageOptions: {
    globals: { ...globals.browser },
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    ...next.configs.recommended.rules,
    ...next.configs['core-web-vitals'].rules,
  },
});
