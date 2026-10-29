import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: '/ft_linear_regression/',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: path('./src/') },
      { find: /^@core\//, replacement: path('../core/') },
      { find: /^@dataset/, replacement: path('../data.csv') },
    ],
  },
});
