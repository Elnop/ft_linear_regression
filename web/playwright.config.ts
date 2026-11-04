import { defineConfig } from '@playwright/test';

const URL = 'http://localhost:4173/ft_linear_regression/';
const onCi = Boolean(process.env['CI']);

export default defineConfig({
  testDir: 'e2e',
  tsconfig: './tsconfig.test.json',
  timeout: 60_000,
  forbidOnly: onCi,
  reporter: onCi ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: URL,
    viewport: { width: 1400, height: 900 },
    reducedMotion: 'no-preference',
    actionTimeout: 20_000,
    trace: 'retain-on-failure',
  },
  webServer: { command: 'npx vite preview --port 4173 --strictPort', url: URL, reuseExistingServer: !onCi },
  projects: [
    { name: 'paintless', grep: /@paintless/, use: { launchOptions: { args: ['--disable-webgl', '--disable-webgl2'] } } },
    { name: 'painting', grep: /@painting/, timeout: 90_000, use: { launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } } },
  ],
});
