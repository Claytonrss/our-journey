'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-between"
      style={{
        height: '72px',
        borderRadius: '20px 20px 0 0',
        background: 'rgba(17,17,17,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(212,175,55,0.15)',
        padding: '0 24px',
      }}
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <button
        onClick={handlePrev}
        className="flex items-center justify-center transition-all"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.2)',
          color: 'var(--gold)',
        }}
        aria-label="Memória anterior"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="text-center flex-1 mx-4">
        <p
          className="truncate"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '15px',
            color: 'var(--text-primary)',
          }}
        >
          {currentMemory?.title || 'Nenhuma memória'}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginTop: '2px',
          }}
        >
          ◆ {currentIndex + 1} de {memories.length} ◆
        </p>
      </div>

      <button
        onClick={handleNext}
        className="flex items-center justify-center transition-all"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.2)',
          color: 'var(--gold)',
        }}
        aria-label="Próxima memória"
      >
        <ChevronRight size={20} />
      </button>
    </motion.div>
  );
}
