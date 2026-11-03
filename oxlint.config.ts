import { oxlintConfig } from '@elnop/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [oxlintConfig],
  plugins: ['typescript', 'import', 'oxc', 'unicorn', 'node'],
  env: { node: true, es2024: true },
  ignorePatterns: ['web'],
});
