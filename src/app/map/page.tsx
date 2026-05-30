'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/hooks/useAppStore';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { memoryService } from '@/services/memoryService';
import { MapView } from '@/components/map/MapView';
import {
  MapErrorBoundary,
  MapFallback,
} from '@/components/map/MapErrorBoundary';
import { NavigationOverlay } from '@/components/map/NavigationOverlay';
import { Overlay } from '@/components/overlay/Overlay';
import { AudioPlayer } from '@/components/player/AudioPlayer';
import type { Memory } from '@/types';

export default function MapPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const {
    activeMemoryId,
    setActiveMemoryId,
    selectedMemoryId,
    setSelectedMemoryId,
    isPinValidated,
  } = useAppStore();
  const router = useRouter();
  const webglSupported = useWebGLSupport();
  const isMobile = useIsMobile();
  const initializedRef = useRef(false);
  const { isPlaying, currentTrack, togglePlay, playTrack } = useAudioPlayer();

  const selectedMemory =
    memories.find((m) => m.id === selectedMemoryId) || null;

  const handlePinClick = (id: string) => {
    setActiveMemoryId(id);
    setSelectedMemoryId(id);
  };

  useEffect(() => {
    if (!isPinValidated) {
      router.push('/');
      return;
    }

    memoryService.getMemories().then((data) => {
      setMemories(data);
      if (data.length > 0 && !initializedRef.current) {
        setActiveMemoryId(data[0].id);
        initializedRef.current = true;
      }
    });
  }, [isPinValidated, router, setActiveMemoryId]);

  useEffect(() => {
    if (!selectedMemory) return;

    const { spotifyUri, localFallbackPath } = selectedMemory.audioConfig;
    playTrack(spotifyUri, localFallbackPath);
  }, [selectedMemory?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (webglSupported === null) {
    return null;
  }

  if (webglSupported === false) {
    return (
      <MapFallback message="Seu navegador não suporta WebGL, necessário para exibir o mapa." />
    );
  }

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return <MapFallback message="Token do Mapbox não configurado." />;
  }

  return (
    <main className="relative min-h-screen">
      <MapErrorBoundary>
        <MapView
          memories={memories}
          activeMemoryId={activeMemoryId}
          onMemorySelect={handlePinClick}
        />
      </MapErrorBoundary>
      <NavigationOverlay
        memories={memories}
        activeMemoryId={activeMemoryId}
        onNavigate={setActiveMemoryId}
      />
      <AnimatePresence>
        {selectedMemory && (
          <Overlay
            memory={selectedMemory}
            onClose={() => setSelectedMemoryId(null)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
      {!selectedMemory && (
        <AudioPlayer
          isPlaying={isPlaying}
          currentTrack={currentTrack}
          onTogglePlay={togglePlay}
        />
      )}
    </main>
  );
}
