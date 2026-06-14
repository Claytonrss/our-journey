import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('detectWebGL', () => {
  let mockGetContext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetContext = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      mockGetContext,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when canvas.getContext returns a WebGL context', async () => {
    mockGetContext.mockReturnValue({});
    const { detectWebGL } = await import('@/hooks/useWebGLSupport');
    expect(detectWebGL()).toBe(true);
  });

  it('returns false when canvas.getContext returns null', async () => {
    mockGetContext.mockReturnValue(null);
    const { detectWebGL } = await import('@/hooks/useWebGLSupport');
    expect(detectWebGL()).toBe(false);
  });

  it('returns false when canvas.getContext throws', async () => {
    mockGetContext.mockImplementation(() => {
      throw new Error('WebGL not available');
    });
    const { detectWebGL } = await import('@/hooks/useWebGLSupport');
    expect(detectWebGL()).toBe(false);
  });
});

describe('useWebGLSupport', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls useSyncExternalStore with subscribe, detectWebGL, and server snapshot returning null', async () => {
    const mockUseSyncExternalStore = vi.fn().mockReturnValue(null);

    vi.doMock('react', async (importOriginal) => {
      const actual = await importOriginal<typeof import('react')>();
      return {
        ...actual,
        useSyncExternalStore: mockUseSyncExternalStore,
      };
    });

    const { useWebGLSupport } = await import('@/hooks/useWebGLSupport');
    renderHook(() => useWebGLSupport());

    expect(mockUseSyncExternalStore).toHaveBeenCalledTimes(1);
    expect(mockUseSyncExternalStore).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );

    const subscribe = mockUseSyncExternalStore.mock.calls[0][0];
    const getSnapshot = mockUseSyncExternalStore.mock.calls[0][1];
    const getServerSnapshot = mockUseSyncExternalStore.mock.calls[0][2];

    expect(typeof subscribe).toBe('function');
    expect(typeof getSnapshot).toBe('function');
    expect(typeof getServerSnapshot).toBe('function');
    expect(getServerSnapshot()).toBe(null);
  });

  it('returns null when useSyncExternalStore returns null (server snapshot)', async () => {
    const mockUseSyncExternalStore = vi.fn().mockReturnValue(null);

    vi.doMock('react', async (importOriginal) => {
      const actual = await importOriginal<typeof import('react')>();
      return {
        ...actual,
        useSyncExternalStore: mockUseSyncExternalStore,
      };
    });

    const { useWebGLSupport } = await import('@/hooks/useWebGLSupport');
    const { result } = renderHook(() => useWebGLSupport());

    expect(result.current).toBeNull();
  });

  it('returns true when useSyncExternalStore returns true', async () => {
    const mockUseSyncExternalStore = vi.fn().mockReturnValue(true);

    vi.doMock('react', async (importOriginal) => {
      const actual = await importOriginal<typeof import('react')>();
      return {
        ...actual,
        useSyncExternalStore: mockUseSyncExternalStore,
      };
    });

    const { useWebGLSupport } = await import('@/hooks/useWebGLSupport');
    const { result } = renderHook(() => useWebGLSupport());

    expect(result.current).toBe(true);
  });

  it('returns false when useSyncExternalStore returns false', async () => {
    const mockUseSyncExternalStore = vi.fn().mockReturnValue(false);

    vi.doMock('react', async (importOriginal) => {
      const actual = await importOriginal<typeof import('react')>();
      return {
        ...actual,
        useSyncExternalStore: mockUseSyncExternalStore,
      };
    });

    const { useWebGLSupport } = await import('@/hooks/useWebGLSupport');
    const { result } = renderHook(() => useWebGLSupport());

    expect(result.current).toBe(false);
  });
});
