import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup-files.ts', './src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/__tests__/**',
        'src/**/*.d.ts',
        'src/data/**',
        'src/types/**',
        // Auth config (NextAuth setup — requires server-side mocking)
        'src/auth.ts',
        // App Router pages and layout (integration-tested via e2e)
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/app/map/page.tsx',
        'src/app/timeline/page.tsx',
        'src/app/api/auth/**',
        // Sentry integration (runtime instrumentation, not unit-testable)
        'src/app/global-error.tsx',
        // UI Components (not in plan scope — cover via integration/e2e)
        'src/components/Providers.tsx',
        'src/components/GlobalAudio.tsx',
        'src/components/ui/ViewToggle.tsx',
        'src/components/features/auth/LockScreen.tsx',
        'src/components/features/IntroScreen/**',
        'src/components/features/map/MapView.tsx',
        'src/components/features/map/MemoryPin.tsx',
        'src/components/features/map/NavigationOverlay.tsx',
        'src/components/features/map/DefaultPinSVG.tsx',
        'src/components/features/map/SpecialPinSVG.tsx',
        'src/components/features/overlay/**',
        'src/components/features/player/**',
        'src/components/features/timeline/**',
        // Hooks not covered in this phase
        'src/hooks/useMapFlyTo.ts',
        'src/hooks/useWebGLSupport.ts',
      ],
      thresholds: {
        lines: 75,
        functions: 80,
        branches: 80,
        statements: 75,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
