'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/hooks/useAppStore';
import { memoryService } from '@/services/memoryService';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import {
  groupMemoriesByYear,
  calculateMemoryStats,
} from '@/lib/memory-grouping';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { AudioPlayer } from '@/components/features/player/AudioPlayer';
import { TimelineHeader } from './TimelineHeader';
import { TimelineEndNote } from './TimelineEndNote';
import { GoldLine } from './GoldLine';
import { YearDivider } from './YearDivider';
import { MemoryCard } from './MemoryCard';
import type { Memory } from '@/types';

export function TimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const { activeMemoryId, isPinValidated, setActiveMemoryId } = useAppStore();
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);
  const hasScrolledToActiveRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const { isPlaying, togglePlay } = useAudioPlayer();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    // Redireciona para login se não estiver validado
    if (!isPinValidated) {
      router.push('/');
      return;
    }

    // Carrega memórias reais do json
    memoryService.getMemories().then(setMemories);
  }, [isPinValidated, router]);

  useEffect(() => {
    if (
      !activeMemoryId ||
      memories.length === 0 ||
      hasScrolledToActiveRef.current
    ) {
      return;
    }

    isProgrammaticScrollRef.current = true;

    const frameId = window.requestAnimationFrame(() => {
      const activeCard = document.getElementById(
        `memory-card-${activeMemoryId}`,
      );

      if (!activeCard) {
        isProgrammaticScrollRef.current = false;
        hasScrolledToActiveRef.current = true;
        return;
      }

      activeCard.scrollIntoView({ block: 'center', behavior: 'smooth' });

      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        hasScrolledToActiveRef.current = true;
      }, 700);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeMemoryId, memories.length]);

  useEffect(() => {
    if (memories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        const mostVisibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const memoryId =
          mostVisibleEntry?.target.getAttribute('data-memory-id');

        if (memoryId) {
          setActiveMemoryId(memoryId);
        }
      },
      {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    memories.forEach((memory) => {
      const card = document.getElementById(`memory-card-${memory.id}`);
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [memories, setActiveMemoryId]);

  // Se não estiver validado (esperando redirect), não renderiza nada
  if (!isPinValidated) {
    return null;
  }

  const { yearSpan } = calculateMemoryStats(memories);

  const yearEntries = Array.from(groupMemoriesByYear(memories).entries());

  return (
    <motion.main
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen overflow-y-auto overflow-x-hidden"
      style={{ background: 'var(--bg-void)' }}
    >
      <div className="relative mx-auto max-w-2xl px-6 md:px-12 pb-24">
        <GoldLine scrollYProgress={scrollYProgress} />

        <div className="relative">
          <TimelineHeader yearSpan={yearSpan} />

          {yearEntries.map(([year, yearMemories]) => (
            <React.Fragment key={year}>
              <YearDivider year={year} />
              {yearMemories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </React.Fragment>
          ))}

          <TimelineEndNote />
        </div>
      </div>

      <AnimatePresence>
        <AudioPlayer
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          variant="minimal"
        />
      </AnimatePresence>
      <ViewToggle bottomOffset="24px" />
    </motion.main>
  );
}
