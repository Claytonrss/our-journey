'use client';

import { motion, useDragControls, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { MemoryContent } from './MemoryContent';
import { MasonryGallery } from './MasonryGallery';
import type { Memory } from '@/types';

interface OverlayProps {
  memory: Memory | null;
  onClose: () => void;
  isMobile: boolean;
}

export function Overlay({ memory, onClose, isMobile }: OverlayProps) {
  if (!memory) return null;

  if (isMobile) {
    return <MobileOverlay memory={memory} onClose={onClose} />;
  }

  return <DesktopOverlay memory={memory} onClose={onClose} />;
}

interface OverlayContentProps {
  memory: Memory;
  onClose: () => void;
}

function MobileOverlay({ memory, onClose }: OverlayContentProps) {
  const dragControls = useDragControls();

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-20"
        style={{ background: 'rgba(10,10,10,0.6)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed inset-x-0 bottom-0 z-30 shadow-2xl flex flex-col"
        style={{
          height: '70vh',
          background: '#111111',
          borderRadius: '28px 28px 0 0',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <div className="relative shrink-0" style={{ height: '48px' }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(10,10,10,0.9), transparent)',
              borderRadius: '28px 28px 0 0',
            }}
          />
        </div>

        <div className="shrink-0 flex items-center justify-center pb-2 relative">
          <div
            className="cursor-grab active:cursor-grabbing"
            style={{
              width: '36px',
              height: '4px',
              background: 'rgba(212,175,55,0.25)',
              borderRadius: '2px',
            }}
            onPointerDown={(e) => dragControls.start(e)}
          />
          <button
            onClick={onClose}
            className="absolute right-6 p-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Fechar painel"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto space-y-6"
          style={{ padding: '0 24px 24px' }}
        >
          <MemoryContent memory={memory} />
          {memory.images.length > 0 && (
            <MasonryGallery images={memory.images} />
          )}
        </div>
      </motion.div>
    </>
  );
}

function DesktopOverlay({ memory, onClose }: OverlayContentProps) {
  return (
    <>
      <motion.div
        className="fixed inset-0 z-30"
        style={{ background: 'rgba(10,10,10,0.4)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed top-0 right-0 z-40 h-full w-full max-w-md shadow-2xl"
        style={{ background: '#111111' }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex items-center justify-between"
            style={{
              padding: '24px',
              borderBottom: '1px solid rgba(212,175,55,0.1)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}
            >
              Detalhes da Memória
            </h3>
            <button
              onClick={onClose}
              className="p-2 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Fechar painel"
            >
              <X size={20} />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto space-y-6"
            style={{ padding: '24px' }}
          >
            <MemoryContent memory={memory} />
            {memory.images.length > 0 && (
              <MasonryGallery images={memory.images} />
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
