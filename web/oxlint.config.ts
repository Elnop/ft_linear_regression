import { reactViteConfig } from '@brutalway/oxlint-config-react-vite';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [reactViteConfig],
  ignorePatterns: ['dist'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ regex: '^\\.\\.?/', message: 'Relative imports are not allowed: import through an alias (@/, @core/, @e2e/).' }] }],
  },
});
