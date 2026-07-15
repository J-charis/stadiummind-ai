import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Separate from vite.config.ts so production build config is never affected
// by test-only settings. Reuses the same plugins/aliases via mergeConfig so
// `@/...` imports resolve identically in tests and in the app.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/tests/setupTests.ts'],
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.d.ts',
          'src/tests/**',
          'src/main.tsx',
          'src/prompts/**',
          'src/services/mock/**',
        ],
      },
    },
  }),
);
