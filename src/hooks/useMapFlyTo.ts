'use client';

import { useEffect, useRef } from 'react';
import type { MapRef } from 'react-map-gl/mapbox';
import type { Memory } from '@/types';

interface UseMapFlyToOptions {
  mapRef: React.RefObject<MapRef | null>;
  memories: Memory[];
  activeMemoryId: string | null;
  isMapLoaded: boolean;
}

export function useMapFlyTo({
  mapRef,
  memories,
  activeMemoryId,
  isMapLoaded,
}: UseMapFlyToOptions) {
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !activeMemoryId) return;

    const memory = memories.find((m) => m.id === activeMemoryId);
    if (!memory) return;

    const { lng, lat } = memory.coordinates;

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: isFirstLoad.current ? 0 : 4000,
      essential: true,
    });

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    }
  }, [activeMemoryId, memories, isMapLoaded, mapRef]);
}
