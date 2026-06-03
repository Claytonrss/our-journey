'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Map, { MapRef } from 'react-map-gl/mapbox';
import { MemoryPin } from './MemoryPin';
import { useMapFlyTo } from '@/hooks/useMapFlyTo';
import { MapFallback } from './MapErrorBoundary';
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
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mapbox-token')
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao obter o token do mapa');
        return res.json();
      })
      .then((data) => {
        setMapboxToken(data.token);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Erro ao obter token do Mapbox');
        setIsLoading(false);
      });
  }, []);

  useMapFlyTo({
    mapRef,
    memories,
    activeMemoryId,
    isMapLoaded,
  });

  const handleLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  if (isLoading) {
    return <MapFallback message="Carregando mapa..." />;
  }

  if (error || !mapboxToken) {
    return (
      <MapFallback message={error || 'Token do Mapbox não configurado.'} />
    );
  }

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
        mapboxAccessToken={mapboxToken}
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
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(8,8,8,0.7) 100%)',
        }}
      />
    </div>
  );
}
