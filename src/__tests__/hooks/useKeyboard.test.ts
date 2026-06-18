import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
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
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

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
