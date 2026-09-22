import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['src/test/setup.ts'],
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,vue}', 'api/**/*.ts'],
        exclude: ['src/**/__tests__/**', 'src/test/**', '**/*.d.ts', '**/*.types.ts'],
        reporter: ['text', 'html', 'lcov'],
      },
    },
  }),
)
