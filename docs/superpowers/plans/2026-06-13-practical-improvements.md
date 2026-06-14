# Practical Improvements — Our Journey

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the highest-impact, lowest-risk improvements that stabilize the project, fix real vulnerabilities, and establish guardrails — without over-engineering.

**Architecture:** This plan focuses on 6 practical work streams: (1) fix vulnerable dev toolchain, (2) add security headers + rate limit PIN, (3) harden env validation, (4) clean up lint warnings and eslint config, (5) improve CI pipeline, (6) add basic logging. Each is independent and can be executed in any order.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest 2.1.9 (upgrading to 3.x), Zod, Zustand, ESLint 9, pnpm 9, GitHub Actions.

---

## Prioritization Logic

The original `melhoria-plano.md` identified 6 categories of improvement. After analysis, many items are documentation updates (low urgency), E2E setup (medium effort, deferred until after CI is solid), or observability additions (nice-to-have). This plan strips down to what delivers **real quality gains with minimal risk**:

| Done? | Item                                                        | Why it matters                                                              | Effort |
| ----- | ----------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
|       | Upgrade Vitest/Vite/esbuild to fix critical/high advisories | Critical vuln in Vitest <3.2.6 (arbitrary file read); high vuln in esbuild  | M      |
|       | Add security headers in `next.config.ts`                    | Low effort, meaningful protection against clickjacking, MIME sniffing, etc. | S      |
|       | Add rate limiting to PIN server action                      | 4-digit PIN with no rate limit is trivially brute-forcible                  | S      |
|       | Validate public env with Zod                                | `publicEnv.ts` has zero validation; if var is missing, silent undefined     | S      |
|       | Fix lint warnings + exclude coverage from ESLint            | 7 warnings including coverage dir noise; easy cleanup                       | S      |
|       | Improve CI: cache, pnpm v4 action, coverage upload          | CI has no caching, uses outdated pnpm action v3, no coverage artifact       | S-M    |
|       | Add structured logger helper                                | Replace raw `console.error/info` with redacting logger for server code      | S      |
|       | Fix `memoryService` silent fallback in dev                  | Returning `[]` on schema error hides data bugs; fail loudly in dev          | S      |

**Explicitly deferred** (not for this plan):

- Playwright E2E setup (M effort, needs CI stable first)
- Sentry integration (observability is important but not a quality gate)
- Docs updates (important but doesn't affect runtime quality)
- CSP headers (complex with Mapbox/Spotify/Cloudinary; separate task)
- Persisted PIN state (requires design decision; not just a fix)

---

## File Structure

| File                                              | Action | Responsibility                                            |
| ------------------------------------------------- | ------ | --------------------------------------------------------- |
| `package.json`                                    | Modify | Upgrade vitest, @vitest/coverage-v8, @vitejs/plugin-react |
| `vitest.config.ts`                                | Modify | Update if API changes with vitest 3.x                     |
| `next.config.ts`                                  | Modify | Add security `headers()` section                          |
| `src/app/actions/auth.ts`                         | Modify | Add rate limiting logic                                   |
| `src/lib/env.ts`                                  | Modify | No changes (already solid)                                |
| `src/lib/publicEnv.ts`                            | Modify | Add Zod validation                                        |
| `src/__tests__/lib/publicEnv.test.ts`             | Modify | Update to match new validation                            |
| `eslint.config.mjs`                               | Modify | Add `coverage/**` to globalIgnores                        |
| `src/__tests__/types/schemas.test.ts`             | Modify | Remove unused vars                                        |
| `scripts/organize-photos.ts`                      | Modify | Remove unused vars                                        |
| `src/components/features/timeline/MemoryCard.tsx` | Modify | Remove unused vars                                        |
| `.github/workflows/ci.yml`                        | Modify | Add cache, pnpm v4, coverage upload                       |
| `src/lib/logger.ts`                               | Create | Structured logging helper                                 |
| `src/services/memoryService.ts`                   | Modify | Throw in dev, fallback in prod                            |

---

## Task 1: Upgrade Vitest + Vite Toolchain (Fix Critical/High Advisories)

**Files:**

- Modify: `package.json`
- Modify: `vitest.config.ts` (if needed for API changes)

The current `vitest@2.1.9` has a critical vulnerability (GHSA-5xrq-8626-4rwp: arbitrary file read/execute via Vitest UI server). `esbuild@0.21.5` (transitive) has high-severity issues. Vitest 3.x is the current stable line and resolves the critical advisory.

- [ ] **Step 1: Upgrade vitest and related dev dependencies**

Run:

```bash
pnpm add -D vitest@latest @vitest/coverage-v8@latest @vitejs/plugin-react@latest
```

- [ ] **Step 2: Verify the upgrade resolved advisories**

Run:

```bash
pnpm audit --audit-level moderate
```

Expected: No critical or high advisories. Some moderate advisories in transitive deps (postcss via next) may remain — those require Next.js to update, which is out of scope.

- [ ] **Step 3: Run the existing test suite to confirm compatibility**

Run:

```bash
pnpm run test
```

Expected: All 88 tests pass. If Vitest 3.x changed any APIs, fix the failures before proceeding.

- [ ] **Step 4: Run coverage to confirm thresholds still pass**

Run:

```bash
pnpm run test:coverage
```

Expected: All thresholds met (lines ≥75, functions ≥80, branches ≥80, statements ≥75).

- [ ] **Step 5: Check for Vite deprecation warnings**

Run:

```bash
pnpm run test 2>&1 | grep -i "deprecated\|warning"
```

The current test run shows "Vite Node API CJS deprecated" — check if the new version resolves or changes this warning.

- [ ] **Step 6: Update `vitest.config.ts` if needed**

If Vitest 3.x renamed or removed any config options (check release notes), update `vitest.config.ts`. Common changes in Vitest 3: `include` patterns, `coverage` config format, `environment` options. Compare the current config with the new API.

- [ ] **Step 7: Run build to confirm nothing breaks**

Run:

```bash
pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "chore: upgrade vitest to v3 to fix critical/high advisories"
```

---

## Task 2: Add Security Headers in `next.config.ts`

**Files:**

- Modify: `src/../next.config.ts` (i.e., `next.config.ts` at project root)

Add conservative security headers to all routes. CSP is deliberately excluded because Mapbox, Spotify SDK, Cloudinary, and `next/font` make a strict CSP complex to get right — that's a separate task.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/lib/security-headers.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';

describe('Next.js security headers', () => {
  it('defines headers for all routes', () => {
    const headers = nextConfig.headers;
    expect(headers).toBeDefined();
    expect(typeof headers).toBe('function');
  });

  it('includes X-Content-Type-Options: nosniff', async () => {
    const result = await nextConfig.headers!();
    const main = result.find((r) => r.source === '/(.*)');
    expect(main).toBeDefined();
    const h = main!.headers;
    expect(h.find((x) => x.key === 'X-Content-Type-Options')!.value).toBe(
      'nosniff',
    );
  });

  it('includes Referrer-Policy: strict-origin-when-cross-origin', async () => {
    const result = await nextConfig.headers!();
    const main = result.find((r) => r.source === '/(.*)');
    const h = main!.headers;
    expect(h.find((x) => x.key === 'Referrer-Policy')!.value).toBe(
      'strict-origin-when-cross-origin',
    );
  });

  it('includes X-Frame-Options: DENY', async () => {
    const result = await nextConfig.headers!();
    const main = result.find((r) => r.source === '/(.*)');
    const h = main!.headers;
    expect(h.find((x) => x.key === 'X-Frame-Options')!.value).toBe('DENY');
  });

  it('includes Permissions-Policy blocking camera, microphone, geolocation', async () => {
    const result = await nextConfig.headers!();
    const main = result.find((r) => r.source === '/(.*)');
    const h = main!.headers;
    expect(h.find((x) => x.key === 'Permissions-Policy')!.value).toBe(
      'camera=(), microphone=(), geolocation=()',
    );
  });
});
```

Note: `next.config.ts` uses `NextConfig` which has `headers` as `Header[] | (() => Promise<Header[]>)`. The test expects a function return (async).

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run test -- src/__tests__/lib/security-headers.test.ts`

Expected: FAIL — `nextConfig.headers` is currently `undefined`.

- [ ] **Step 3: Implement security headers**

Replace `next.config.ts` with:

```ts
import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(isDev && { allowedDevOrigins: ['127.0.0.1'] }),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run test -- src/__tests__/lib/security-headers.test.ts`

Expected: All 5 tests pass.

- [ ] **Step 5: Run full test suite**

Run: `pnpm run test`

Expected: All tests pass (including new ones).

- [ ] **Step 6: Run build**

Run: `pnpm run build`

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add next.config.ts src/__tests__/lib/security-headers.test.ts
git commit -m "feat: add security headers (X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy)"
```

---

## Task 3: Add Rate Limiting to PIN Server Action

**Files:**

- Modify: `src/app/actions/auth.ts`
- Modify: `src/__tests__/app/actions/auth.test.ts`

The current `validatePin` has no rate limiting — a 4-digit PIN (10,000 combinations) can be brute-forced in seconds. We'll add simple in-memory rate limiting: 5 attempts per 60-second window. This is sufficient for a portfolio project — no need for Upstash KV at this stage.

- [ ] **Step 1: Write the failing test**

Add to `src/__tests__/app/actions/auth.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  getPinEnv: () => ({ SECRET_PIN: '1917' }),
}));

describe('validatePin', () => {
  let validatePin: (pin: string) => Promise<boolean>;

  beforeAll(async () => {
    const mod = await import('@/app/actions/auth');
    validatePin = mod.validatePin;
  });

  it('returns true for correct PIN', async () => {
    const result = await validatePin('1917');
    expect(result).toBe(true);
  });

  it('returns false for wrong PIN', async () => {
    const result = await validatePin('0000');
    expect(result).toBe(false);
  });

  it('returns false for PIN shorter than 4 digits', async () => {
    const result = await validatePin('191');
    expect(result).toBe(false);
  });

  it('returns false for PIN longer than 4 digits', async () => {
    const result = await validatePin('19170');
    expect(result).toBe(false);
  });

  it('returns false for PIN with letters', async () => {
    const result = await validatePin('abcd');
    expect(result).toBe(false);
  });

  it('returns false for empty string', async () => {
    const result = await validatePin('');
    expect(result).toBe(false);
  });
});

describe('validatePin rate limiting', () => {
  let validatePin: (
    pin: string,
  ) => Promise<boolean | { locked: true; remainingMs: number }>;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('@/app/actions/auth');
    validatePin = mod.validatePin;
  });

  it('locks after 5 failed attempts and returns locked status', async () => {
    for (let i = 0; i < 5; i++) {
      await validatePin('0000');
    }
    const result = await validatePin('0000');
    expect(result).toEqual({ locked: true, remainingMs: expect.any(Number) });
  });

  it('does not lock on correct PIN attempt', async () => {
    const result = await validatePin('1917');
    expect(result).toBe(true);
  });

  it('does not count successful attempt toward lockout', async () => {
    await validatePin('1917');
    // After a successful attempt, the failed count should remain at 0
    // So 5 more failed attempts should still lock
    for (let i = 0; i < 5; i++) {
      const r = await validatePin('0000');
      expect(r).toBe(false);
    }
    const result = await validatePin('0000');
    expect(result).toEqual({ locked: true, remainingMs: expect.any(Number) });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run test -- src/__tests__/app/actions/auth.test.ts`

Expected: The rate-limiting tests fail because `validatePin` currently returns `boolean`, not the locked object.

- [ ] **Step 3: Implement rate-limited validatePin**

Replace `src/app/actions/auth.ts`:

```ts
'use server';

import { getPinEnv } from '@/lib/env';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000;

let failedAttempts = 0;
let lockoutUntil = 0;

export async function validatePin(
  pin: string,
): Promise<boolean | { locked: true; remainingMs: number }> {
  const now = Date.now();

  if (now < lockoutUntil) {
    return {
      locked: true,
      remainingMs: Math.ceil((lockoutUntil - now) / 1000) * 1000,
    };
  }

  const { SECRET_PIN } = getPinEnv();

  if (pin.length !== 4) return false;

  if (pin === SECRET_PIN) {
    failedAttempts = 0;
    return true;
  }

  failedAttempts += 1;

  if (failedAttempts >= MAX_ATTEMPTS) {
    lockoutUntil = now + LOCKOUT_DURATION_MS;
    failedAttempts = 0;
    return { locked: true, remainingMs: LOCKOUT_DURATION_MS };
  }

  return false;
}
```

- [ ] **Step 4: Update LockScreen to handle locked response**

In `src/components/features/auth/LockScreen.tsx`, the `handlePinSubmit` function needs to handle the new return type. Find the `startTransition` block and update:

The current code:

```tsx
const isValid = await validatePin(pin);
if (isValid) {
```

Change to:

```tsx
const result = await validatePin(pin);
if (result === true) {
```

And after the `} else {` that handles the error case, add handling for the locked state. Replace the existing else block:

```tsx
const result = await validatePin(pin);
if (result === true) {
  localStorage.setItem(STORAGE_KEY, audioMode);
  setPinValidated(true);
  setUseLocalAudio(audioMode === 'local');
  setIsUnlocking(true);
  setTimeout(() => {
    router.push('/map');
  }, 800);
} else if (typeof result === 'object' && result.locked) {
  setIsError(true);
  setErrorMessage(
    `Bloqueado. Tente novamente em ${result.remainingMs / 1000}s.`,
  );
  setPin('');
  setTimeout(() => {
    inputRefs.current[0]?.focus();
  }, 0);
} else {
  setIsError(true);
  const matched = PIN_PATTERNS.find((p) => p.regex.test(pin));
  if (matched) {
    setErrorMessage(matched.message);
  } else {
    const randomMsg =
      RANDOM_ERRORS[Math.floor(Math.random() * RANDOM_ERRORS.length)];
    setErrorMessage(randomMsg);
  }
  setPin('');
  setTimeout(() => {
    inputRefs.current[0]?.focus();
  }, 0);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm run test -- src/__tests__/app/actions/auth.test.ts`

Expected: All tests pass, including rate-limiting tests.

- [ ] **Step 6: Run full test suite**

Run: `pnpm run test`

Expected: All tests pass.

- [ ] **Step 7: Run build**

Run: `pnpm run build`

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/app/actions/auth.ts src/__tests__/app/actions/auth.test.ts src/components/features/auth/LockScreen.tsx
git commit -m "feat: add rate limiting to PIN validation (5 attempts, 60s lockout)"
```

---

## Task 4: Validate Public Env with Zod

**Files:**

- Modify: `src/lib/publicEnv.ts`
- Modify: `src/__tests__/lib/publicEnv.test.ts`

`publicEnv.ts` currently just exports `process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI` without validation. If it's missing, the value is silently `undefined`.

- [ ] **Step 1: Read current publicEnv test to understand existing coverage**

Read `src/__tests__/lib/publicEnv.test.ts`.

- [ ] **Step 2: Write the failing test**

Update or create `src/__tests__/lib/publicEnv.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('getPublicEnv', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns valid public env when NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI', 'spotify:playlist:test123');
    const { getPublicEnv } = await import('@/lib/publicEnv');
    const env = getPublicEnv();
    expect(env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI).toBe(
      'spotify:playlist:test123',
    );
  });

  it('throws when NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI', '');
    // The import will cache the module, so we need importFresh approach
    // Since Zod will throw on empty string too
    const { getPublicEnv } = await import('@/lib/publicEnv');
    expect(() => getPublicEnv()).toThrow();
  });

  it('throws when NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI is undefined', async () => {
    vi.stubEnv('NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI', undefined);
    const { getPublicEnv } = await import('@/lib/publicEnv');
    expect(() => getPublicEnv()).toThrow();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm run test -- src/__tests__/lib/publicEnv.test.ts`

Expected: The "throws when missing" tests fail because `publicEnv` currently returns `undefined` silently.

- [ ] **Step 4: Implement Zod-validated publicEnv**

Replace `src/lib/publicEnv.ts`:

```ts
import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI: z.string().min(1, 'Required'),
});

let cached: z.infer<typeof publicEnvSchema> | null = null;

export function getPublicEnv() {
  cached ??= publicEnvSchema.parse({
    NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI:
      process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI,
  });
  return cached;
}

export const publicEnv = {
  get NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI() {
    return getPublicEnv().NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI;
  },
};
```

- [ ] **Step 5: Update any imports that use `publicEnv` directly**

Search for `publicEnv` imports across the codebase. If any file does `publicEnv.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI`, it will still work because we kept the object with a getter. Verify no breaking changes.

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm run test -- src/__tests__/lib/publicEnv.test.ts`

Expected: All tests pass.

- [ ] **Step 7: Run full test suite**

Run: `pnpm run test`

Expected: All tests pass.

- [ ] **Step 8: Run build**

Run: `pnpm run build`

- [ ] **Step 9: Commit**

```bash
git add src/lib/publicEnv.ts src/__tests__/lib/publicEnv.test.ts
git commit -m "feat: add Zod validation to public env (NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI)"
```

---

## Task 5: Fix Lint Warnings + Exclude Coverage from ESLint

**Files:**

- Modify: `eslint.config.mjs`
- Modify: `src/__tests__/types/schemas.test.ts` — remove unused variables
- Modify: `src/components/features/timeline/MemoryCard.tsx` — remove unused variables
- Modify: `scripts/organize-photos.ts` — remove unused variables

Current lint output: 7 warnings (0 errors). 2 are from `coverage/` dir (should be excluded), 5 are `@typescript-eslint/no-unused-vars`.

- [ ] **Step 1: Add `coverage/**` to ESLint globalIgnores\*\*

Update `eslint.config.mjs`:

```mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
  ]),
]);

export default eslintConfig;
```

- [ ] **Step 2: Identify and fix unused variables in warning files**

Read each file and remove or prefix with `_` the unused variables:

- `src/__tests__/types/schemas.test.ts` — 3 unused vars
- `scripts/organize-photos.ts` — 1 unused var
- `src/components/features/timeline/MemoryCard.tsx` — 1 unused var

Edit each file: remove unused imports or prefix unused destructured vars with `_`.

- [ ] **Step 3: Run lint**

Run: `pnpm run lint`

Expected: 0 warnings, 0 errors.

- [ ] **Step 4: Run build to confirm nothing breaks**

Run: `pnpm run build`

- [ ] **Step 5: Commit**

```bash
git add eslint.config.mjs src/__tests__/types/schemas.test.ts scripts/organize-photos.ts src/components/features/timeline/MemoryCard.tsx
git commit -m "fix: resolve all lint warnings, exclude coverage from ESLint"
```

---

## Task 6: Improve CI Pipeline

**Files:**

- Modify: `.github/workflows/ci.yml`

Current CI uses `pnpm/action-setup@v3` (should be v4), has no caching, no coverage upload, and runs `test` instead of `test:coverage`.

- [ ] **Step 1: Update CI workflow**

Replace `.github/workflows/ci.yml`:

```yaml
name: Continuous Integration

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    env:
      SECRET_PIN: '1234'
      AUTH_SECRET: ci-secret-key-min-32-chars-long-enough
      AUTH_URL: http://127.0.0.1:3000
      NEXTAUTH_URL: http://127.0.0.1:3000
      SPOTIFY_CLIENT_ID: test-client-id
      SPOTIFY_CLIENT_SECRET: test-client-secret
      NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI: spotify:playlist:test
      MAPBOX_TOKEN: pk.test-token
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: demo
      CLOUDINARY_CLOUD_NAME: demo
      CLOUDINARY_API_KEY: test
      CLOUDINARY_API_SECRET: test
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Cache Next.js
        uses: actions/cache@v4
        with:
          path: .next/cache
          key: ${{ runner.os }}-next-${{ hashFiles('pnpm-lock.yaml') }}-${{ hashFiles('src/**/*', 'next.config.ts') }}
          restore-keys: |
            ${{ runner.os }}-next-${{ hashFiles('pnpm-lock.yaml') }}-

      - name: Check Formatting
        run: pnpm run format:check

      - name: Run Linter
        run: pnpm run lint

      - name: Run Unit Tests with Coverage
        run: pnpm run test:coverage

      - name: Upload Coverage Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

      - name: Verify TypeScript & Build
        run: pnpm run build
```

Key changes:

- Added env vars needed for build/test (SECRET_PIN, AUTH_SECRET, etc.)
- Upgraded `pnpm/action-setup` from v3 to v4
- Added `cache: pnpm` to node setup
- Added Next.js cache step
- Changed `test` to `test:coverage`
- Added coverage artifact upload (7-day retention)
- Separated `pnpm/action-setup` before `setup-node` (pnpm needed first for cache)

- [ ] **Step 2: Verify YAML is valid**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` or just visually confirm the YAML structure is correct.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: upgrade pipeline — pnpm v4, caching, coverage, env vars for build"
```

---

## Task 7: Add Structured Logger Helper

**Files:**

- Create: `src/lib/logger.ts`
- Create: `src/__tests__/lib/logger.test.ts`

Current code uses `console.error/info` directly, which can leak secrets in logs and is unstructured. Create a simple logger that adds context and redacts sensitive fields.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/lib/logger.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLogger } from '@/lib/logger';

describe('createLogger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('logs info with service context', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger('test-service');
    logger.info('hello', { key: 'value' });
    expect(infoSpy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'info',
        service: 'test-service',
        message: 'hello',
        key: 'value',
      }),
    );
  });

  it('logs error with service context', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = createLogger('auth');
    logger.error('something failed', { code: 401 });
    expect(errorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'error',
        service: 'auth',
        message: 'something failed',
        code: 401,
      }),
    );
  });

  it('redacts known sensitive fields', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger('spotify');
    logger.info('token obtained', { accessToken: 'secret123', track: 'Song' });
    expect(infoSpy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'info',
        service: 'spotify',
        message: 'token obtained',
        accessToken: '[REDACTED]',
        track: 'Song',
      }),
    );
  });

  it('redacts PIN fields', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = createLogger('pin');
    logger.error('invalid pin', { pin: '1234', attempt: 3 });
    expect(errorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'error',
        service: 'pin',
        message: 'invalid pin',
        pin: '[REDACTED]',
        attempt: 3,
      }),
    );
  });

  it('works without extra context', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger('memory');
    logger.info('loaded memories');
    expect(infoSpy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'info',
        service: 'memory',
        message: 'loaded memories',
      }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run test -- src/__tests__/lib/logger.test.ts`

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the logger**

Create `src/lib/logger.ts`:

```ts
const SENSITIVE_KEYS = new Set([
  'accessToken',
  'refreshToken',
  'clientSecret',
  'secret',
  'pin',
  'password',
  'token',
  'apiKey',
  'apiSecret',
]);

function redact(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = SENSITIVE_KEYS.has(key) ? '[REDACTED]' : value;
  }
  return result;
}

export function createLogger(service: string) {
  function log(
    level: 'info' | 'error',
    message: string,
    context?: Record<string, unknown>,
  ) {
    const payload: Record<string, unknown> = {
      level,
      service,
      message,
      ...(context ? redact(context) : {}),
    };
    if (level === 'error') {
      console.error(JSON.stringify(payload));
    } else {
      console.info(JSON.stringify(payload));
    }
  }

  return {
    info: (message: string, context?: Record<string, unknown>) =>
      log('info', message, context),
    error: (message: string, context?: Record<string, unknown>) =>
      log('error', message, context),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run test -- src/__tests__/lib/logger.test.ts`

Expected: All 5 tests pass.

- [ ] **Step 5: Run full test suite**

Run: `pnpm run test`

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/logger.ts src/__tests__/lib/logger.test.ts
git commit -m "feat: add structured logger with sensitive field redaction"
```

---

## Task 8: Fix `memoryService` Silent Fallback in Dev

**Files:**

- Modify: `src/services/memoryService.ts`
- Modify: `src/__tests__/services/memoryService.test.ts`

Currently `memoryService.getMemories()` catches Zod errors and returns `[]`, which silently hides data corruption bugs in development. The fix: throw in dev, return empty with logged warning in production.

- [ ] **Step 1: Read the current memoryService test**

Read `src/__tests__/services/memoryService.test.ts` to understand existing test for the error case.

- [ ] **Step 2: Add test for dev-mode throw behavior**

Add to the existing test file:

```ts
it('throws on invalid memories in development mode', async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  // Force re-import to pick up env change
  vi.resetModules();

  // Need a module that will fail validation
  vi.doMock('@/data/memories.json', () => ({
    default: [{ id: 'bad' }], // Missing required fields
  }));

  const { memoryService } = await import('@/services/memoryService');

  await expect(memoryService.getMemories()).rejects.toThrow();

  process.env.NODE_ENV = originalEnv;
  vi.doUnmock('@/data/memories.json');
});
```

Note: The exact mocking approach may need adjustment depending on how the existing tests mock `memories.json`. Review the existing test file and adapt accordingly.

- [ ] **Step 3: Update memoryService.ts**

Replace `src/services/memoryService.ts`:

```ts
import { Memory, MemorySchema } from '@/types';
import { z } from 'zod';

const isDev = process.env.NODE_ENV === 'development';

export const memoryService = {
  getMemories: async (): Promise<Memory[]> => {
    try {
      const data = await import('@/data/memories.json');
      const listSchema = z.array(MemorySchema);
      return listSchema.parse(data.default);
    } catch (error) {
      if (isDev) {
        throw error;
      }
      console.error(
        'Erro ao carregar e validar o arquivo memories.json',
        error,
      );
      return [];
    }
  },
};
```

- [ ] **Step 4: Update the existing test that expects `[]` on invalid input**

The existing test likely verifies that `getMemories()` returns `[]` on invalid data. In dev mode it now throws. Update that test to either:

- Set `NODE_ENV=production` for that specific test, or
- Expect it to throw in the default test environment (which is `development` or `test`).

Review `src/__tests__/services/memoryService.test.ts` and update accordingly.

- [ ] **Step 5: Run tests**

Run: `pnpm run test`

Expected: All tests pass. The `ZodError` that was printed to stderr in the old version should now only appear in dev mode, and the test should assert `throw` behavior.

- [ ] **Step 6: Run build**

Run: `pnpm run build`

- [ ] **Step 7: Commit**

```bash
git add src/services/memoryService.ts src/__tests__/services/memoryService.test.ts
git commit -m "fix: throw on invalid memories in dev, fallback in prod"
```
