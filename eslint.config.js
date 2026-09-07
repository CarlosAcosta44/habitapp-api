// eslint.config.js for ESLint v9
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';

const compat = new FlatCompat({
  baseDirectory: path.resolve(import.meta.url, '../'),
});

export default [
  js.configs.recommended,
  ...compat.config({
    parserOptions: { project: './tsconfig.json' },
  }).map(config => ({
    ...config,
    rules: {
      ...config.rules,
      // Add any project specific overrides here
    },
  })),
];
