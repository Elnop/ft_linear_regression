import { typescriptConfig } from '@elnop/oxlint-config-typescript';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [typescriptConfig],
  plugins: ['typescript', 'import', 'oxc', 'unicorn', 'node'],
  env: { node: true, es2024: true },
  ignorePatterns: ['web'],
  overrides: [
    { files: ['cli/**'], rules: { 'no-console': 'off' } },
    {
      files: ['core/**'],
      env: { node: false },
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              { regex: '^[^.]', message: 'core/ also runs in the browser: it imports no package and no node: module.' },
              { regex: '^(\\.\\./)+(cli|web)(/|$)', message: 'core/ is the bottom layer: it never imports cli/ or web/.' },
            ],
          },
        ],
        'no-restricted-globals': ['error', { name: 'process', message: 'core/ also runs in the browser: read process in cli/ and pass the value in.' }],
      },
    },
  ],
});
