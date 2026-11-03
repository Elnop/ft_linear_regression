import { componentPropsConfig } from '@elnop/oxlint-config-component-props';
import { exportPlacementConfig } from '@elnop/oxlint-config-export-placement';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'oxlint';

const resolveFromHere = (specifier: string) => fileURLToPath(import.meta.resolve(specifier));

export const oxlintConfig = defineConfig({
  extends: [exportPlacementConfig, componentPropsConfig],
  plugins: ['typescript', 'import', 'oxc', 'unicorn'],
  jsPlugins: [
    { name: 'file-named-after-export', specifier: resolveFromHere('@elnop/eslint-plugin-file-named-after-export') },
    { name: 'store-layout', specifier: resolveFromHere('@elnop/eslint-plugin-store-layout') },
    { name: 'no-comments', specifier: resolveFromHere('eslint-plugin-no-comments') },
    { name: 'check-file', specifier: resolveFromHere('eslint-plugin-check-file') },
  ],
  categories: { correctness: 'error', suspicious: 'error' },
  env: { es2024: true },
  rules: {
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-duplicates': 'error',
    'typescript/no-floating-promises': 'error',
    'typescript/no-misused-promises': 'error',
    'typescript/await-thenable': 'error',
    'typescript/no-unnecessary-type-assertion': 'error',
    'typescript/consistent-type-imports': 'error',
    'typescript/no-explicit-any': 'error',
    'no-shadow': 'off',
    'unicorn/consistent-function-scoping': 'off',
    'typescript/consistent-return': 'off',
    'oxc/no-barrel-file': ['error', { threshold: 0 }],
    'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
    'no-comments/disallowComments': ['error', { allow: ['oxlint-', 'eslint-', '@ts-expect-error', '@ts-ignore', '@ts-nocheck', '/ <reference ', '/usr/bin/env '] }],
    'check-file/no-index': ['error', { errorMessage: 'Barrel files ({{ target }}) are not allowed: import each module by its own path' }],
    'check-file/filename-blocklist': ['error', { '**/types.ts': '*Types.ts' }],
    'file-named-after-export/file-named-after-export': 'error',
    'store-layout/store-layout': 'error',
  },
  overrides: [
    { files: ['**/*.test.ts', '**/*.test.tsx'], rules: { 'typescript/no-floating-promises': 'off' } },
    { files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', 'e2e/**'], rules: { 'file-named-after-export/file-named-after-export': 'off' } },
  ],
});
