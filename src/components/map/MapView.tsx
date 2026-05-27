'use client';

import { useState, useRef, useCallback } from 'react';
import Map, { MapRef } from 'react-map-gl/mapbox';
import { MemoryPin } from './MemoryPin';
import { useMapFlyTo } from '@/hooks/useMapFlyTo';
import type { Memory } from '@/types';

interface MapViewProps {
  memories: Memory[];
  activeMemoryId: string | null;
  onMemorySelect: (id: string) => void;
}

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

export function MapView({
  memories,
  activeMemoryId,
  onMemorySelect,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useMapFlyTo({
    mapRef,
    memories,
    activeMemoryId,
    isMapLoaded,
  });

  const handleLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 2,
        }}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        onLoad={handleLoad}
        reuseMaps
        attributionControl={false}
      >
        {memories.map((memory) => (
          <MemoryPin
            key={memory.id}
            memory={memory}
            isActive={memory.id === activeMemoryId}
            onClick={onMemorySelect}
          />
        ))}
      </Map>
    </div>
  );
}
