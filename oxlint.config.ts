import { typescriptConfig } from '@elnop/oxlint-config-typescript';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [typescriptConfig],
  plugins: ['typescript', 'import', 'oxc', 'unicorn', 'node'],
  env: { node: true, es2024: true },
  ignorePatterns: ['web'],
});
