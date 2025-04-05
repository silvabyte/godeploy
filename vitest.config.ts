/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/vitest/setup.ts'],
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    deps: {
      inline: ['@fastify/autoload'],
    },
    environment: 'node',
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
