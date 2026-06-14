import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { MapRef } from 'react-map-gl/mapbox';
import { useMapFlyTo } from '@/hooks/useMapFlyTo';
import type { Memory } from '@/types';

function createMockMemories(): Memory[] {
  return [
    {
      id: 'mem-1',
      title: 'Test Memory 1',
      date: '2023-01-01',
      coordinates: { lat: -23.5, lng: -46.6 },
      isSpecialPin: false,
      description: 'Desc 1',
      images: [],
    },
    {
      id: 'mem-2',
      title: 'Test Memory 2',
      date: '2023-02-02',
      coordinates: { lat: -22.9, lng: -43.2 },
      isSpecialPin: true,
      description: 'Desc 2',
      images: [],
    },
  ];
}

function createMockMapRef(mockFlyTo = vi.fn()) {
  return { current: { flyTo: mockFlyTo } as unknown as MapRef };
}

describe('useMapFlyTo', () => {
  let mockFlyTo: ReturnType<typeof vi.fn>;
  let memories: Memory[];

  beforeEach(() => {
    mockFlyTo = vi.fn();
    memories = createMockMemories();
  });

  it('does not call flyTo when isMapLoaded is false', () => {
    const mapRef = createMockMapRef(mockFlyTo);

    renderHook(() =>
      useMapFlyTo({
        mapRef: mapRef as React.RefObject<MapRef | null>,
        memories,
        activeMemoryId: 'mem-1',
        isMapLoaded: false,
      }),
    );

    expect(mockFlyTo).not.toHaveBeenCalled();
  });

  it('does not call flyTo when activeMemoryId is null', () => {
    const mapRef = createMockMapRef(mockFlyTo);

    renderHook(() =>
      useMapFlyTo({
        mapRef: mapRef as React.RefObject<MapRef | null>,
        memories,
        activeMemoryId: null,
        isMapLoaded: true,
      }),
    );

    expect(mockFlyTo).not.toHaveBeenCalled();
  });

  it('does not call flyTo when memory is not found', () => {
    const mapRef = createMockMapRef(mockFlyTo);

    renderHook(() =>
      useMapFlyTo({
        mapRef: mapRef as React.RefObject<MapRef | null>,
        memories,
        activeMemoryId: 'non-existent-id',
        isMapLoaded: true,
      }),
    );

    expect(mockFlyTo).not.toHaveBeenCalled();
  });

  it('calls flyTo with correct coordinates from the matching memory', () => {
    const mapRef = createMockMapRef(mockFlyTo);

    renderHook(() =>
      useMapFlyTo({
        mapRef: mapRef as React.RefObject<MapRef | null>,
        memories,
        activeMemoryId: 'mem-1',
        isMapLoaded: true,
      }),
    );

    expect(mockFlyTo).toHaveBeenCalledTimes(1);
    expect(mockFlyTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [-46.6, -23.5],
      }),
    );
  });

  it('calls flyTo with zoom 15 and essential true', () => {
    const mapRef = createMockMapRef(mockFlyTo);

    renderHook(() =>
      useMapFlyTo({
        mapRef: mapRef as React.RefObject<MapRef | null>,
        memories,
        activeMemoryId: 'mem-1',
        isMapLoaded: true,
      }),
    );

    expect(mockFlyTo).toHaveBeenCalledWith(
      expect.objectContaining({
        zoom: 15,
        essential: true,
      }),
    );
  });

  it('uses duration 0 on first call and duration 4000 on subsequent calls', () => {
    const mapRef = createMockMapRef(mockFlyTo);

    const { rerender } = renderHook(
      ({ activeMemoryId }) =>
        useMapFlyTo({
          mapRef: mapRef as React.RefObject<MapRef | null>,
          memories,
          activeMemoryId,
          isMapLoaded: true,
        }),
      { initialProps: { activeMemoryId: 'mem-1' as string | null } },
    );

    expect(mockFlyTo).toHaveBeenCalledTimes(1);
    expect(mockFlyTo).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 0 }),
    );

    rerender({ activeMemoryId: 'mem-2' });

    expect(mockFlyTo).toHaveBeenCalledTimes(2);
    expect(mockFlyTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ duration: 4000 }),
    );
  });
});
