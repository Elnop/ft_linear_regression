import { oxlintConfig } from '@elnop/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [oxlintConfig],
  plugins: ['typescript', 'react', 'import', 'oxc', 'unicorn'],
  env: { browser: true, es2024: true },
  ignorePatterns: ['dist'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ regex: '^\\.\\.?/', message: 'Relative imports are not allowed: import through an alias (@/, @core/, @e2e/).' }] }],
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/only-export-components': 'error',
    'typescript/no-non-null-assertion': 'off',
    'import/default': 'off',
    'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
    'no-unused-expressions': 'off',
    'unicorn/prefer-add-event-listener': 'off',
  },
  overrides: [{ files: ['e2e/**'], env: { node: true } }],
});
