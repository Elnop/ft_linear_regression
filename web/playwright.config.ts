import { defineConfig } from '@playwright/test';

const URL = 'http://localhost:4173/ft_linear_regression/';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: URL,
    viewport: { width: 1400, height: 900 },
    reducedMotion: 'no-preference',
    actionTimeout: 20_000,
    trace: 'retain-on-failure',
  },
  webServer: { command: 'npx vite preview --port 4173 --strictPort', url: URL, reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'paintless', grep: /@paintless/, use: { launchOptions: { args: ['--disable-webgl', '--disable-webgl2'] } } },
    { name: 'painting', grep: /@painting/, use: { launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } } },
  ],
});
