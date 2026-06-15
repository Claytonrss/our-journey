# Design — Keyboard Navigation for Lightbox

**Date:** 2026-06-15
**Status:** Draft
**Source:** [BACKLOG.md](../../BACKLOG.md) — "Suporte a navegação por teclado (←/→/Esc) no Lightbox"

## Problem

The `Lightbox` component (`src/components/features/overlay/Lightbox.tsx`) supports swipe gestures and on-screen buttons for navigation, but has zero keyboard support. Users on desktop or with keyboard-dependent accessibility needs cannot navigate between photos or dismiss the overlay without a mouse/touch.

## Scope

Three keyboard shortcuts inside the Lightbox overlay:

| Key          | Action         |
| ------------ | -------------- |
| `ArrowLeft`  | Previous photo |
| `ArrowRight` | Next photo     |
| `Escape`     | Close lightbox |

No additional shortcuts (Space, Home/End, etc.).

## Approach: Generic `useKeyboard` Hook

Create a reusable `useKeyboard` hook rather than inlining a `useEffect` in the Lightbox. This follows the project's existing convention of custom hooks (`useIsMobile`, `useMapFlyTo`, `useWebGLSupport`) and keeps the keyboard logic testable in isolation.

### Rejected Alternatives

- **Inline `useEffect` in Lightbox** — simpler but couples keyboard logic to the component and makes it untestable in isolation.
- **Dedicated `useLightboxKeyboard` hook** — over-engineering for 3 key bindings; a generic hook covers the need and is reusable.

## Architecture

### `useKeyboard` Hook

**File:** `src/hooks/useKeyboard.ts`

```ts
type KeyMap = Record<string, () => void>;

function useKeyboard(keyMap: KeyMap, enabled?: boolean): void;
```

**Behavior:**

1. Accepts a `Record<Key, Callback>` map and an optional `enabled` flag (default `true`).
2. Attaches a `keydown` listener on `document` when mounted and `enabled` is `true`.
3. On keydown, looks up `event.key` in the map and calls the matching callback.
4. Ignores events when `event.target` is `<input>`, `<textarea>`, or `[contenteditable]` to avoid interfering with form inputs.
5. Uses an internal `useRef` for the keyMap to avoid re-registering the listener when callbacks change identity between renders.
6. Removes the listener on unmount or when `enabled` becomes `false`.

### Lightbox Integration

Inside `Lightbox.tsx`, add a single hook call:

```tsx
useKeyboard({
  ArrowLeft: goPrev,
  ArrowRight: goNext,
  Escape: onClose,
});
```

- `goPrev` and `goNext` are existing functions in the component.
- `onClose` is an existing prop.
- No changes to `LightboxProps` interface.
- No changes to consumers (`MasonryGallery`, `CardPhotoStrip`).

### Accessibility

- **Focus trap:** Not required. The lightbox is a `position: fixed` overlay at `zIndex: 100` with a dark backdrop. The `document`-level listener works regardless of focus position. Adding a focus trap would add complexity without meaningful benefit for this overlay pattern.
- **`aria-live` counter:** Add `aria-live="polite"` to the photo counter element (`"2 / 5"`) so screen readers announce position changes.
- **Focus on open:** Move focus to the lightbox container element on mount so keyboard context is correct. Focus restore to the trigger element is out of scope — it would require tracking the trigger across consumers and adds complexity without meaningful UX benefit for this use case.

### Edge Cases

| Scenario                               | Behavior                                            |
| -------------------------------------- | --------------------------------------------------- |
| First photo + `ArrowLeft`              | No-op (matches existing button behavior)            |
| Last photo + `ArrowRight`              | No-op (matches existing button behavior)            |
| Single image (`images.length === 1`)   | `ArrowLeft`/`ArrowRight` are no-op; `Escape` closes |
| Focus inside `<input>` or `<textarea>` | Hook ignores the event                              |
| Lightbox not mounted                   | No listener active (hook unmounts with component)   |

## Testing Strategy

### Unit Tests (Vitest + Testing Library)

**`useKeyboard` hook tests:**

1. Calls correct callback when mapped key is pressed
2. Does nothing for unmapped keys
3. Ignores events from `<input>` elements
4. Ignores events from `<textarea>` elements
5. Ignores events from `[contenteditable]` elements
6. Cleans up listener on unmount
7. Respects `enabled` flag — no callbacks when `false`
8. Handles rapid key presses without stale closures

**Lightbox integration tests:**

1. `ArrowRight` navigates to next image
2. `ArrowLeft` navigates to previous image
3. `Escape` closes the lightbox
4. No navigation at boundaries (first/last)

### E2E Tests (Playwright)

1. Open lightbox from gallery, press `ArrowRight`, verify next photo is displayed
2. Press `Escape`, verify lightbox is closed
3. Verify counter updates after keyboard navigation

## Files Changed

| File                                                | Change                                                                            |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/hooks/useKeyboard.ts`                          | **New** — generic keyboard hook                                                   |
| `src/hooks/useKeyboard.test.ts`                     | **New** — unit tests for hook                                                     |
| `src/components/features/overlay/Lightbox.tsx`      | **Modified** — add `useKeyboard` call + `aria-live` on counter + focus management |
| `src/components/features/overlay/Lightbox.test.tsx` | **New** — integration tests for keyboard nav                                      |
| `e2e/lightbox-keyboard.spec.ts`                     | **New** — E2E test for keyboard flow                                              |

## Non-Goals

- No focus trap implementation
- No keyboard shortcuts beyond ←/→/Esc
- No changes to swipe gesture behavior
- No changes to `LightboxProps` interface
- No changes to consumer components
