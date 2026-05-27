'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Memory } from '@/types';

interface NavigationOverlayProps {
  memories: Memory[];
  activeMemoryId: string | null;
  onNavigate: (id: string) => void;
}

export function NavigationOverlay({
  memories,
  activeMemoryId,
  onNavigate,
}: NavigationOverlayProps) {
  if (memories.length === 0) return null;

  const currentIndex = memories.findIndex((m) => m.id === activeMemoryId);
  const currentMemory = currentIndex >= 0 ? memories[currentIndex] : null;

  const handlePrev = () => {
    const prevIndex =
      currentIndex <= 0 ? memories.length - 1 : currentIndex - 1;
    onNavigate(memories[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex =
      currentIndex >= memories.length - 1 ? 0 : currentIndex + 1;
    onNavigate(memories[nextIndex].id);
  };

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-5 rounded-full px-6 py-3 border border-white/10"
      style={{
        background: 'rgba(45, 27, 14, 0.75)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <button
        onClick={handlePrev}
        className="p-2 text-[var(--color-brand-gold)] hover:text-[var(--color-brand-rose)] transition-all duration-300"
        aria-label="Memória anterior"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="text-center min-w-[180px]">
        <p className="text-[var(--color-brand-gold)] font-medium truncate text-sm uppercase tracking-wider">
          {currentMemory?.title || 'Nenhuma memória'}
        </p>
        <p className="text-[var(--color-brand-rose)] text-xs opacity-70">
          {currentIndex + 1} / {memories.length}
        </p>
      </div>

      <button
        onClick={handleNext}
        className="p-2 text-[var(--color-brand-gold)] hover:text-[var(--color-brand-rose)] transition-all duration-300"
        aria-label="Próxima memória"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
