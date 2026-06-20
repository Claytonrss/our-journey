'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/hooks/useAppStore';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { memoryService } from '@/services/memoryService';
import { MapView } from '@/components/features/map/MapView';
import {
  MapErrorBoundary,
  MapFallback,
} from '@/components/features/map/MapErrorBoundary';
import { NavigationOverlay } from '@/components/features/map/NavigationOverlay';
import { Overlay } from '@/components/features/overlay/Overlay';
import { AudioPlayer } from '@/components/features/player/AudioPlayer';
import {
  IntroScreen,
  HeadphonesScreen,
} from '@/components/features/IntroScreen';
import { ViewToggle } from '@/components/ui/ViewToggle';
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
  const { isPlaying, togglePlay } = useAudioPlayer();

  const headphonesSeenOnMount =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('headphones-seen') === 'true';

  const [headphonesComplete, setHeadphonesComplete] = useState(
    headphonesSeenOnMount,
  );

  const setGlobalHeadphonesComplete = useAppStore(
    (state) => state.setHeadphonesComplete,
  );

  useEffect(() => {
    if (headphonesSeenOnMount) {
      setGlobalHeadphonesComplete(true);
    }
  }, [headphonesSeenOnMount, setGlobalHeadphonesComplete]);

  const introSeenOnMount =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('intro-seen') === 'true';

  const [introComplete, setIntroComplete] = useState(introSeenOnMount);

  const handleIntroComplete = useCallback(() => {
    setActiveMemoryId(memories[0].id);
    setIntroComplete(true);
  }, [memories, setActiveMemoryId]);

  const selectedMemory =
    memories.find((m) => m.id === selectedMemoryId) || null;

  const handlePinClick = (id: string) => {
    setActiveMemoryId(id);
    setSelectedMemoryId(id);
  };

  const handleNavigateToTimeline = (id: string) => {
    setActiveMemoryId(id);
    setSelectedMemoryId(null);
    router.push('/timeline');
  };

  useEffect(() => {
    if (!isPinValidated) {
      router.push('/');
      return;
    }

    memoryService.getMemories().then((data) => {
      setMemories(data);
      if (data.length > 0 && !initializedRef.current) {
        const currentActiveMemoryId = useAppStore.getState().activeMemoryId;

        if (introSeenOnMount && !currentActiveMemoryId) {
          setActiveMemoryId(data[0].id);
        }
        initializedRef.current = true;
      }
    });
  }, [isPinValidated, router, setActiveMemoryId, introSeenOnMount]);

  if (webglSupported === null) {
    return null;
  }

  if (webglSupported === false) {
    return (
      <MapFallback message="Seu navegador não suporta WebGL, necessário para exibir o mapa." />
    );
  }

  if (!headphonesComplete) {
    return (
      <HeadphonesScreen
        onComplete={() => {
          setHeadphonesComplete(true);
          setGlobalHeadphonesComplete(true);
        }}
      />
    );
  }

  if (!introComplete) {
    return <IntroScreen onComplete={handleIntroComplete} />;
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
        onTitleClick={() => setSelectedMemoryId(activeMemoryId)}
      />
      <AnimatePresence mode="wait">
        {selectedMemory && (
          <Overlay
            key={selectedMemory.id}
            memory={selectedMemory}
            onClose={() => setSelectedMemoryId(null)}
            onNavigateToTimeline={handleNavigateToTimeline}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!selectedMemory && (
          <AudioPlayer isPlaying={isPlaying} onTogglePlay={togglePlay} />
        )}
      </AnimatePresence>
      {!selectedMemory && <ViewToggle bottomOffset="92px" />}
    </main>
  );
}
