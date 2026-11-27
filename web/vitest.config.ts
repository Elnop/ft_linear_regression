import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: [
        {
          find: /^@test-support\//u,
          replacement: fileURLToPath(new URL('./test/support/', import.meta.url)),
        },
      ],
    },
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'node',
            include: ['test/unit/**/*.test.ts'],
            css: true,
          },
        },
        {
          extends: true,
          test: {
            name: 'component',
            include: ['test/unit/**/*.test.tsx'],
            browser: {
              enabled: true,
              provider: playwright(),
              headless: true,
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },
  }),
);
