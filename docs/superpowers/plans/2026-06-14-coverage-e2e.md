# Coverage Cleanup + E2E Playwright Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (1) Extract pure logic from excluded coverage components into testable utilities, (2) Install and configure Playwright for E2E, (3) Create priority E2E test scenarios

**Architecture:** Part 1 refactors components to isolate testable logic into pure functions under `src/lib/`. Part 2 sets up Playwright with Chromium + Mobile Chrome, auth fixtures and API mocking. Part 3 implements critical E2E test scenarios.

**Tech Stack:** Vitest + RTL (unit), Playwright (E2E), Next.js 16 App Router, pnpm

---

## File Structure

```
New files:
├── e2e/
│   ├── fixtures/
│   │   ├── auth.ts              # PIN bypass fixture
│   │   └── api-mocks.ts         # Intercept /api/mapbox-token, /api/spotify-token
│   ├── pin-flow.spec.ts          # PIN lock/unlock scenarios
│   ├── map.spec.ts               # Map page with mocked Mapbox
│   ├── timeline.spec.ts          # Timeline rendering
│   └── mobile.spec.ts            # Mobile viewport
├── playwright.config.ts
├── src/lib/
│   ├── pin-validation.ts         # Extracted from LockScreen
│   ├── memory-grouping.ts        # Extracted from TimelinePage
│   └── navigation-utils.ts       # Extracted from NavigationOverlay
├── src/__tests__/
│   ├── lib/
│   │   ├── pin-validation.test.ts
│   │   ├── memory-grouping.test.ts
│   │   └── navigation-utils.test.ts
│   └── hooks/
│       ├── useMapFlyTo.test.ts
│       └── useWebGLSupport.test.ts

Modified files:
├── vitest.config.ts              # Update coverage exclusions
├── package.json                  # Add @playwright/test + scripts
├── .gitignore                    # Add Playwright report patterns
├── .husky/pre-push                # Add test:e2e
├── .github/workflows/ci.yml      # Add Playwright steps
├── src/components/features/auth/LockScreen.tsx
├── src/components/features/timeline/TimelinePage.tsx
├── src/components/features/map/NavigationOverlay.tsx
```

---

## PART 1: Extract Pure Logic + Unit Tests

### Task 1: Extract `pin-validation.ts` from LockScreen

**Files:**

- Create: `src/lib/pin-validation.ts`
- Modify: `src/components/features/auth/LockScreen.tsx`
- Create: `src/__tests__/lib/pin-validation.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/lib/pin-validation.test.ts` with tests for:

- `getPinErrorMessage(pin, patterns)` — tests pattern matching and random fallback
- `isPinValid(pin)` — tests numeric validation `/^\d{4}$/`
- `buildPinFromDigits(digits, index, value)` — tests positional PIN building logic

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm run test -- src/__tests__/lib/pin-validation.test.ts`
Expected: FAIL (module does not exist)

- [ ] **Step 3: Create `src/lib/pin-validation.ts`**

Extract from `LockScreen.tsx`:

1. `PIN_PATTERNS` array of `{ regex, message }` objects
2. `getPinErrorMessage(pin: string, patterns: PinPattern[]): string` — returns first pattern message that matches, or random fallback message
3. `isPinValid(pin: string): boolean` — checks if PIN is 4 numeric digits
4. `buildPinFromDigits(currentPin: string, index: number, value: string): string` — positional digit substitution logic

- [ ] **Step 4: Refactor LockScreen.tsx to import from `pin-validation.ts`**

Replace inline logic with `import { getPinErrorMessage, isPinValid, buildPinFromDigits } from '@/lib/pin-validation'`

- [ ] **Step 5: Run tests and verify they pass**

Run: `pnpm run test -- src/__tests__/lib/pin-validation.test.ts`
Expected: PASS

- [ ] **Step 6: Run all existing tests to verify nothing broke**

Run: `pnpm run test`
Expected: All existing tests continue passing

- [ ] **Step 7: Commit**

```bash
git add src/lib/pin-validation.ts src/__tests__/lib/pin-validation.test.ts src/components/features/auth/LockScreen.tsx
git commit -m "refactor: extract pin validation logic into testable utilities"
```

---

### Task 2: Extract `memory-grouping.ts` from TimelinePage

**Files:**

- Create: `src/lib/memory-grouping.ts`
- Modify: `src/components/features/timeline/TimelinePage.tsx`
- Create: `src/__tests__/lib/memory-grouping.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/lib/memory-grouping.test.ts` with tests for:

- `sortMemoriesByDate(memories)` — sorts by date ascending
- `groupMemoriesByYear(memories)` — returns `Map<number, Memory[]>`
- `calculateMemoryStats(memories)` — returns `{ minYear, maxYear, yearSpan, totalPhotos }`

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm run test -- src/__tests__/lib/memory-grouping.test.ts`

- [ ] **Step 3: Create `src/lib/memory-grouping.ts`**

Extract from `TimelinePage.tsx`:

1. `sortMemoriesByDate(memories: Memory[]): Memory[]`
2. `groupMemoriesByYear(memories: Memory[]): Map<number, Memory[]>`
3. `calculateMemoryStats(memories: Memory[]): { minYear: number; maxYear: number; yearSpan: number; totalPhotos: number }`

- [ ] **Step 4: Refactor TimelinePage.tsx to import**

- [ ] **Step 5: Run tests and verify they pass**

- [ ] **Step 6: Run all tests**

- [ ] **Step 7: Commit**

```bash
git commit -m "refactor: extract memory grouping logic into testable utilities"
```

---

### Task 3: Extract `navigation-utils.ts` from NavigationOverlay

**Files:**

- Create: `src/lib/navigation-utils.ts`
- Modify: `src/components/features/map/NavigationOverlay.tsx`
- Create: `src/__tests__/lib/navigation-utils.test.ts`

- [ ] **Step 1: Write failing tests**

Tests for:

- `getPrevIndex(current, total): number` — circular navigation (0 → last)
- `getNextIndex(current, total): number` — circular navigation (last → 0)

- [ ] **Step 2-6: Same flow as previous tasks**

- [ ] **Step 7: Commit**

```bash
git commit -m "refactor: extract circular navigation logic into testable utilities"
```

---

### Task 4: Create tests for `useMapFlyTo` and `useWebGLSupport`

**Files:**

- Create: `src/__tests__/hooks/useMapFlyTo.test.ts`
- Create: `src/__tests__/hooks/useWebGLSupport.test.ts`

- [ ] **Step 1: Write test for `useMapFlyTo`**

Mock `mapRef.current.flyTo` with `vi.fn()`. Verify that `flyTo` is called with correct coordinates and that `isFirstLoad` affects duration.

- [ ] **Step 2: Write test for `useWebGLSupport`**

Extract `detectWebGL()` function for direct testing. Mock `document.createElement` for true/false cases. Verify server snapshot returns `null`.

- [ ] **Step 3: Run all tests**

- [ ] **Step 4: Commit**

```bash
git commit -m "test: add unit tests for useMapFlyTo and useWebGLSupport hooks"
```

---

### Task 5: Update coverage exclusions in `vitest.config.ts`

**Files:**

- Modify: `vitest.config.ts`

- [ ] **Step 1: Remove files that now have unit tests from exclusions**

Remove from `coverage.exclude`:

- `src/hooks/useMapFlyTo.ts` — now has tests
- `src/hooks/useWebGLSupport.ts` — now has tests

Keep justified exclusions (pages, auth config, Mapbox components, etc.). Update comments to reflect current reasoning.

- [ ] **Step 2: Run coverage and verify numbers improved**

Run: `pnpm run test:coverage`

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: update coverage exclusions after adding unit tests"
```

---

## PART 2: Install and Configure Playwright

### Task 6: Install Playwright and create config

**Files:**

- Create: `playwright.config.ts`
- Modify: `package.json` (scripts and devDependency)
- Modify: `.gitignore`

- [ ] **Step 1: Install Playwright**

Run: `pnpm add -D @playwright/test && pnpm exec playwright install --with-deps chromium`

- [ ] **Step 2: Add scripts to package.json**

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

- [ ] **Step 3: Create `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm run build && pnpm run start --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
```

- [ ] **Step 4: Update `.gitignore`**

Add:

```
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: install and configure Playwright for E2E testing"
```

---

### Task 7: Create auth and API mocking fixtures

**Files:**

- Create: `e2e/fixtures/auth.ts`
- Create: `e2e/fixtures/api-mocks.ts`

- [ ] **Step 1: Create auth fixture (`e2e/fixtures/auth.ts`)**

Fixture that:

1. Reads `SECRET_PIN` from env
2. Fills the PIN on the lock screen and submits
3. Waits for navigation to `/map`
4. Exports helper `authenticateViaPin(page)` for inline use

- [ ] **Step 2: Create API mocking fixture (`e2e/fixtures/api-mocks.ts`)**

Helpers:

1. `mockMapboxToken(page)` — intercepts `/api/mapbox-token` and returns mock token
2. `mockSpotifyToken(page)` — intercepts `/api/spotify-token` and returns mock token
3. `blockSpotifySDK(page)` — blocks `sdk.scdn.co` to simulate failure

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add Playwright auth and API mock fixtures"
```

---

## PART 3: Priority E2E Tests

### Task 8: E2E — PIN Flow

**Files:**

- Create: `e2e/pin-flow.spec.ts`

Scenarios:

1. Lock screen renders with PIN input field
2. Invalid PIN shows error and does not navigate to `/map`
3. Valid PIN navigates to `/map`
4. Non-numeric characters are rejected in PIN input

- [ ] **Step 1: Write spec with all 4 scenarios**

- [ ] **Step 2: Run E2E and verify they pass**

Run: `SECRET_PIN=1234 pnpm run test:e2e -- --project=chromium e2e/pin-flow.spec.ts`

- [ ] **Step 3: Commit**

```bash
git commit -m "test(e2e): add PIN flow scenarios"
```

---

### Task 9: E2E — Map page with mocked Mapbox

**Files:**

- Create: `e2e/map.spec.ts`

Scenarios:

1. `/map` renders fallback when Mapbox token fails
2. `/map` with mocked Mapbox renders the map and pins
3. Clicking a pin opens overlay with memory details
4. Closing overlay returns to map

- [ ] **Step 1-3: Same flow**

```bash
git commit -m "test(e2e): add map page scenarios"
```

---

### Task 10: E2E — Timeline rendering

**Files:**

- Create: `e2e/timeline.spec.ts`

Scenarios:

1. `/timeline` renders memories grouped by year
2. Year dividers appear correctly
3. Navigation back to map works (ViewToggle)

- [ ] **Step 1-3: Same flow**

```bash
git commit -m "test(e2e): add timeline rendering scenarios"
```

---

### Task 11: E2E — Mobile viewport

**Files:**

- Create: `e2e/mobile.spec.ts`

Scenarios:

1. Lock screen renders correctly on mobile viewport
2. Overlay does not cover essential controls
3. Audio player renders in mobile mode

- [ ] **Step 1-3: Same flow**

```bash
git commit -m "test(e2e): add mobile viewport scenarios"
```

---

### Task 12: Update pre-push hook

**Files:**

- Modify: `.husky/pre-push`

- [ ] **Step 1: Add `test:e2e` to pre-push hook**

Add after `pnpm run build` line:

```
pnpm run test:e2e
```

Note: Since E2E needs the app built, order should be: format:check → test → build → test:e2e

- [ ] **Step 2: Test the hook by running a dry push**

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: add E2E tests to pre-push hook"
```

---

### Task 13: Update CI workflow

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add Playwright steps after build**

```yaml
- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps chromium

- name: Run E2E tests
  run: pnpm run test:e2e

- name: Upload Playwright report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7
```

- [ ] **Step 2: Commit**

```bash
git commit -m "ci: add Playwright E2E tests to CI workflow"
```

---

## Decision Summary

| Decision            | Choice                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------- |
| E2E Framework       | Playwright                                                                                  |
| Browsers            | Chromium + Mobile Chrome (Pixel 7)                                                          |
| CI                  | Local only for now, pre-push hook. CI workflow prepared but E2E doesn't block PRs initially |
| Coverage exclusions | Removed for tested hooks. Others remain with updated comments                               |
| Extractable logic   | PIN validation, memory grouping, navigation utils → `src/lib/`                              |
| E2E Auth            | Fill PIN on lock screen, reuse storageState                                                 |
