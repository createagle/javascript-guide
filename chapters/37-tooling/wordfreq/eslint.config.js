import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['dist/'] },
  js.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      eqeqeq: 'error',
      'prefer-const': 'error',
      'no-console': 'off',
    },
  },
]);
