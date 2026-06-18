# Lightbox Keyboard Navigation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add keyboard navigation (←/→/Esc) to the Lightbox component via a reusable `useKeyboard` hook.

**Architecture:** Generic `useKeyboard` hook in `src/hooks/useKeyboard.ts` that binds keydown events to callbacks via a `Record<string, () => void>` map. Lightbox calls the hook with `ArrowLeft→goPrev, ArrowRight→goNext, Escape→onClose`. Hook ignores events from form controls and uses a ref internally to avoid stale closures.

**Tech Stack:** React 19, TypeScript (strict), Vitest + @testing-library/react (hook unit tests), Playwright (E2E)

---

## File Structure

| File                                                 | Responsibility                                                                               |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/hooks/useKeyboard.ts`                           | **New** — Generic keydown listener hook with input/form protection                           |
| `src/__tests__/hooks/useKeyboard.test.ts`            | **New** — Unit tests: key dispatch, input filtering, cleanup, enabled toggle, stale closures |
| `src/components/features/overlay/Lightbox.tsx`       | **Modified** — Wire `useKeyboard`, add `aria-live` counter, focus container on mount         |
| `src/__tests__/components/overlay/Lightbox.test.tsx` | **New** — Integration: keyboard triggers nav/close, boundary no-ops                          |
| `e2e/lightbox-keyboard.spec.ts`                      | **New** — E2E: open gallery photo, ArrowRight to next, Escape to close                       |

---

### Task 1: Write failing unit tests for `useKeyboard` hook

**Files:**

- Create: `src/__tests__/hooks/useKeyboard.test.ts`

- [ ] **Step 1: Write the test file with all test cases**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboard } from '@/hooks/useKeyboard';

describe('useKeyboard', () => {
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();
  });

  it('calls the correct callback when a mapped key is pressed', () => {
    const keyMap = { ArrowLeft: callback };
    renderHook(() => useKeyboard(keyMap));

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );

    expect(callback).toHaveBeenCalledOnce();
  });

  it('does nothing for unmapped keys', () => {
    const keyMap = { ArrowLeft: callback };
    renderHook(() => useKeyboard(keyMap));

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );

    expect(callback).not.toHaveBeenCalled();
  });

  it('ignores keydown events from <input> elements', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const keyMap = { Enter: callback };
    renderHook(() => useKeyboard(keyMap));

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    expect(callback).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('ignores keydown events from <textarea> elements', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    const keyMap = { Enter: callback };
    renderHook(() => useKeyboard(keyMap));

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    expect(callback).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  it('ignores keydown events from contenteditable elements', () => {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    document.body.appendChild(div);
    div.focus();

    const keyMap = { Enter: callback };
    renderHook(() => useKeyboard(keyMap));

    div.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    expect(callback).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('removes the event listener on unmount', () => {
    const keyMap = { ArrowLeft: callback };
    const { unmount } = renderHook(() => useKeyboard(keyMap));

    unmount();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call callbacks when enabled is false', () => {
    const keyMap = { ArrowLeft: callback };
    renderHook(() => useKeyboard(keyMap, false));

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );

    expect(callback).not.toHaveBeenCalled();
  });

  it('re-registers listener when enabled toggles from false to true', () => {
    const keyMap = { ArrowLeft: callback };
    const { rerender } = renderHook(
      ({ enabled }) => useKeyboard(keyMap, enabled),
      { initialProps: { enabled: false } },
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );
    expect(callback).not.toHaveBeenCalled();

    rerender({ enabled: true });

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );
    expect(callback).toHaveBeenCalledOnce();
  });

  it('always uses the latest callback reference (no stale closures)', () => {
    let firstCallback = vi.fn();
    let secondCallback = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => useKeyboard({ ArrowLeft: cb }),
      { initialProps: { cb: firstCallback } },
    );

    rerender({ cb: secondCallback });

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they all fail**

Run: `pnpm run test -- src/__tests__/hooks/useKeyboard.test.ts`
Expected: All 9 tests FAIL — `Cannot find module '@/hooks/useKeyboard'`

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/hooks/useKeyboard.test.ts
git commit -m "test: add failing unit tests for useKeyboard hook"
```

---

### Task 2: Implement `useKeyboard` hook

**Files:**

- Create: `src/hooks/useKeyboard.ts`

- [ ] **Step 1: Write the minimal implementation**

```ts
import { useEffect, useRef } from 'react';

type KeyMap = Record<string, () => void>;

export function useKeyboard(keyMap: KeyMap, enabled = true): void {
  const keyMapRef = useRef(keyMap);
  keyMapRef.current = keyMap;

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const callback = keyMapRef.current[event.key];
      if (callback) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [enabled]);
}
```

- [ ] **Step 2: Run tests to verify they all pass**

Run: `pnpm run test -- src/__tests__/hooks/useKeyboard.test.ts`
Expected: All 9 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useKeyboard.ts
git commit -m "feat: add useKeyboard hook for declarative keyboard shortcuts"
```

---

### Task 3: Write failing Lightbox integration tests

**Files:**

- Create: `src/__tests__/components/overlay/Lightbox.test.tsx`

**Note:** Lightbox is excluded from coverage in `vitest.config.ts` (`src/components/features/overlay/**`). These tests validate behavior but do not affect coverage thresholds.

- [ ] **Step 1: Mock dependencies and write tests**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Image as ImageType } from '@/types';

vi.mock('next-cloudinary', () => ({
  CldImage: (props: Record<string, unknown>) => {
    const { alt, onLoad } = props;
    if (onLoad) (onLoad as () => void)();
    return {
      $$typeof: Symbol.for('react.element'),
      type: 'img',
      props: { alt },
    };
  },
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...(actual as object),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      div: ({
        children,
        drag,
        onDragEnd,
        onClick,
        ...props
      }: Record<string, unknown>) => {
        const { 'aria-live': ariaLive, ...rest } = props as Record<
          string,
          unknown
        >;
        return {
          $$typeof: Symbol.for('react.element'),
          type: 'div',
          props: { ...rest, 'aria-live': ariaLive, children },
        };
      },
    },
  };
});

import { Lightbox } from '@/components/features/overlay/Lightbox';

function createImage(overrides: Partial<ImageType> = {}): ImageType {
  return {
    publicId: 'test/photo',
    alt: 'Test photo',
    width: 800,
    height: 600,
    ...overrides,
  };
}

describe('Lightbox keyboard navigation', () => {
  let onClose: ReturnType<typeof vi.fn>;
  let onNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
    onNavigate = vi.fn();
  });

  it('navigates to next image on ArrowRight', async () => {
    const images = [
      createImage({ publicId: 'test/a' }),
      createImage({ publicId: 'test/b' }),
    ];

    render(
      <Lightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.keyboard('{ArrowRight}');
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('navigates to previous image on ArrowLeft', async () => {
    const images = [
      createImage({ publicId: 'test/a' }),
      createImage({ publicId: 'test/b' }),
    ];

    render(
      <Lightbox
        images={images}
        currentIndex={1}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.keyboard('{ArrowLeft}');
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('closes on Escape', async () => {
    const images = [createImage()];

    render(
      <Lightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not navigate past the first image', async () => {
    const images = [
      createImage({ publicId: 'test/a' }),
      createImage({ publicId: 'test/b' }),
    ];

    render(
      <Lightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.keyboard('{ArrowLeft}');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate past the last image', async () => {
    const images = [
      createImage({ publicId: 'test/a' }),
      createImage({ publicId: 'test/b' }),
    ];

    render(
      <Lightbox
        images={images}
        currentIndex={1}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.keyboard('{ArrowRight}');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('renders photo counter with aria-live for screen readers', () => {
    const images = [
      createImage({ publicId: 'test/a' }),
      createImage({ publicId: 'test/b' }),
    ];

    const { container } = render(
      <Lightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    const counter = container.querySelector('[aria-live="polite"]');
    expect(counter).toBeTruthy();
    expect(counter?.textContent).toContain('1 / 2');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm run test -- src/__tests__/components/overlay/Lightbox.test.tsx`
Expected: Tests FAIL — `onClose` not called, `onNavigate` not called on keyboard events

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/components/overlay/Lightbox.test.tsx
git commit -m "test: add failing Lightbox keyboard integration tests"
```

---

### Task 4: Integrate `useKeyboard` into Lightbox

**Files:**

- Modify: `src/components/features/overlay/Lightbox.tsx`

- [ ] **Step 1: Add keyboard hook, aria-live counter, and focus on mount**

Add these changes to `Lightbox.tsx`:

**a) Add imports:**

```tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { useKeyboard } from '@/hooks/useKeyboard';
```

**b) Add the hook call after the existing functions (goPrev, goNext):**

```tsx
useKeyboard({
  ArrowLeft: goPrev,
  ArrowRight: goNext,
  Escape: onClose,
});
```

**c) Add container ref and focus effect (after state declarations, before `isLoading`):**

```tsx
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  containerRef.current?.focus();
}, []);
```

**d) Update the counter `<div>` to include `aria-live`:**
Replace:

```tsx
        <div
          className="absolute bottom-6 left-0 right-0 text-center"
          style={{
```

With:

```tsx
        <div
          className="absolute bottom-6 left-0 right-0 text-center"
          aria-live="polite"
          style={{
```

**e) Update the outer motion.div to accept focus and use the ref:**

The outer `motion.div` (the fullscreen backdrop) needs `tabIndex={-1}` and `ref={containerRef}` to receive focus. Add after the `exit` prop:

```tsx
      ref={containerRef}
      tabIndex={-1}
```

**Full modified file (key sections only):**

Top of file:

```tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useKeyboard } from '@/hooks/useKeyboard';
import type { Image as ImageType } from '@/types';
```

State section:

```tsx
export function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const [loadedIndex, setLoadedIndex] = useState<number | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const isLoading = loadedIndex !== currentIndex;
  const hasError = errorIndex === currentIndex;
```

After goNext function:

```tsx
useKeyboard({
  ArrowLeft: goPrev,
  ArrowRight: goNext,
  Escape: onClose,
});
```

Outer motion.div:

```tsx
    <motion.div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 flex items-center justify-center"
```

Counter:

```tsx
        <div
          className="absolute bottom-6 left-0 right-0 text-center"
          aria-live="polite"
          style={{
```

- [ ] **Step 2: Run unit tests to verify they pass**

Run:

```bash
pnpm run test -- src/__tests__/hooks/useKeyboard.test.ts
pnpm run test -- src/__tests__/components/overlay/Lightbox.test.tsx
```

Expected: Both test suites PASS

- [ ] **Step 3: Run type check to verify TypeScript**

Run: `pnpm run build`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/components/features/overlay/Lightbox.tsx src/hooks/useKeyboard.ts
git commit -m "feat: add keyboard navigation (Arrow keys + Escape) to Lightbox"
```

---

### Task 5: E2E test for keyboard navigation

**Files:**

- Create: `e2e/lightbox-keyboard.spec.ts`

- [ ] **Step 1: Check E2E fixtures and write the spec**

Look at `e2e/fixtures/api-mocks.ts` for the mockMapboxToken helper.

```ts
import { test, expect } from '@playwright/test';
import { mockMapboxToken } from './fixtures/api-mocks';

const VALID_PIN = process.env.SECRET_PIN || '1234';

test.describe('Lightbox Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockMapboxToken(page);

    await page.goto('/');

    await page.evaluate(() => {
      sessionStorage.setItem('intro-seen', 'true');
      sessionStorage.setItem('headphones-seen', 'true');
    });

    const continueBtn = page.locator('text=Continuar Offline');
    await expect(continueBtn).toBeVisible({ timeout: 15000 });
    await continueBtn.click();

    const inputs = page.locator('input[aria-label^="Dígito"]');
    for (let i = 0; i < 4; i++) {
      await inputs.nth(i).fill(VALID_PIN[i]);
    }
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/map', { timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Mapa' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('can navigate photos with keyboard arrows and close with Escape', async ({
    page,
  }) => {
    // Navigate to timeline where photo galleries are accessible
    const timelineBtn = page
      .locator('button')
      .filter({ hasText: 'Linha do tempo' });
    await expect(timelineBtn).toBeVisible({ timeout: 10000 });
    await timelineBtn.click();
    await page.waitForURL('**/timeline', { timeout: 10000 });

    // Click the first photo in a gallery strip to open lightbox
    const firstPhoto = page.locator('img[alt]').first();
    await expect(firstPhoto).toBeVisible({ timeout: 10000 });
    await firstPhoto.click();

    // Verify lightbox is open — close button visible
    const closeBtn = page.locator('button[aria-label="Fechar foto"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });

    // Press ArrowRight to navigate to next photo
    await page.keyboard.press('ArrowRight');

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(closeBtn).not.toBeVisible({ timeout: 5000 });
  });
});
```

- [ ] **Step 2: Run the E2E test**

Run: `pnpm run test:e2e -- e2e/lightbox-keyboard.spec.ts`
Expected: Test PASSes — keyboard navigation works end-to-end

- [ ] **Step 3: Commit**

```bash
git add e2e/lightbox-keyboard.spec.ts
git commit -m "test: add E2E test for Lightbox keyboard navigation"
```

---

## Self-Review

### 1. Spec coverage

| Spec requirement                                        | Covered by                                          |
| ------------------------------------------------------- | --------------------------------------------------- |
| `useKeyboard` hook with KeyMap + enabled                | Task 2 (implementation) + Task 1 (tests)            |
| ArrowLeft → previous, ArrowRight → next, Escape → close | Task 4 (Lightbox integration) + Task 3 (tests)      |
| Ignores events from input/textarea/contenteditable      | Task 1 tests 3-5                                    |
| useRef to avoid re-registering listener                 | Task 1 test 9 (stale closures)                      |
| Cleanup on unmount                                      | Task 1 test 6                                       |
| Respects `enabled` flag                                 | Task 1 tests 7-8                                    |
| aria-live on counter                                    | Task 3 test 6 + Task 4 step 1d                      |
| Focus container on mount                                | Task 4 step 1c                                      |
| No changes to LightboxProps                             | Verified — hook uses existing goPrev/goNext/onClose |
| No changes to consumers                                 | Verified — only Lightbox.tsx modified               |
| Edge case: first/last boundary no-ops                   | Task 3 tests 4-5                                    |
| Edge case: single image                                 | Covered by existing goPrev/goNext guards            |
| E2E: open lightbox, navigate, close                     | Task 5                                              |
| `event.preventDefault()`                                | Task 2 step 1 implementation                        |

### 2. Placeholder scan

No TBD, TODO, "implement later", or vague references. All steps contain exact code.

### 3. Type consistency

- `useKeyboard` signature: `(keyMap: Record<string, () => void>, enabled?: boolean): void` — consistent across Task 1 (import), Task 2 (implementation), and Task 4 (usage)
- `LightboxProps` interface unchanged — `onClose: () => void`, `onNavigate: (index: number) => void` used consistently
- Test file paths match conventions: `src/__tests__/hooks/` and `src/__tests__/components/overlay/`
- E2E follows existing pattern from `e2e/map.spec.ts` (mocks, sessionStorage, PIN flow)
