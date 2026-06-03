'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Memory } from '@/types';

interface NavigationOverlayProps {
  memories: Memory[];
  activeMemoryId: string | null;
  onNavigate: (id: string) => void;
  onTitleClick: () => void;
}

export function NavigationOverlay({
  memories,
  activeMemoryId,
  onNavigate,
  onTitleClick,
}: NavigationOverlayProps) {
  if (memories.length === 0) return null;

  const currentIndex = memories.findIndex((m) => m.id === activeMemoryId);
  const currentMemory = currentIndex >= 0 ? memories[currentIndex] : null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(memories[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < memories.length - 1) {
      onNavigate(memories[currentIndex + 1].id);
    }
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-between"
      style={{
        height: '76px',
        borderRadius: '24px 24px 0 0',
        background: 'rgba(17, 17, 17, 0.85)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderTop: '1px solid var(--gold-line)',
        boxShadow: '0 -4px 24px -2px rgba(212, 175, 55, 0.12)',
        padding: '0 24px',
      }}
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <button
        onClick={handlePrev}
        className="flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background:
            currentIndex === 0 ? 'transparent' : 'rgba(212, 175, 55, 0.1)',
          border:
            currentIndex === 0
              ? '1px solid rgba(212, 175, 55, 0.1)'
              : '1px solid rgba(212, 175, 55, 0.25)',
          color: 'var(--gold)',
        }}
        disabled={currentIndex === 0}
        aria-label="Memória anterior"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        onClick={onTitleClick}
        className="text-center flex-1 mx-4 cursor-pointer"
      >
        <p
          className="truncate"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '15px',
            color: 'var(--text-primary)',
            fontWeight: 500,
          }}
        >
          {currentMemory?.title || 'Nenhuma memória'}
        </p>
        <p
          style={{
            marginTop: '2px',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
            fontSize: '11px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-ui)' }}>
            ◆ {currentIndex + 1}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-playfair)',
              margin: '0 4px',
              fontStyle: 'italic',
            }}
          >
            de
          </span>
          <span style={{ fontFamily: 'var(--font-ui)' }}>
            {memories.length} ◆
          </span>
        </p>
      </button>

      <button
        onClick={handleNext}
        className="flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background:
            currentIndex === memories.length - 1
              ? 'transparent'
              : 'rgba(212, 175, 55, 0.1)',
          border:
            currentIndex === memories.length - 1
              ? '1px solid rgba(212, 175, 55, 0.1)'
              : '1px solid rgba(212, 175, 55, 0.25)',
          color: 'var(--gold)',
        }}
        disabled={currentIndex === memories.length - 1}
        aria-label="Próxima memória"
      >
        <ChevronRight size={24} />
      </button>
    </motion.div>
  );
}
