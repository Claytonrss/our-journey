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
    <motion.div
      className="fixed inset-x-0 bottom-0 z-20 h-[70vh] bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-md rounded-t-3xl shadow-2xl"
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
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-white/10 relative">
          <div
            className="w-12 h-1 bg-gray-600 rounded-full mx-auto cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          />
          <button
            onClick={onClose}
            className="absolute right-4 p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar painel"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <MemoryContent memory={memory} />
          {memory.images.length > 0 && (
            <MasonryGallery images={memory.images} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DesktopOverlay({ memory, onClose }: OverlayContentProps) {
  return (
    <>
      <motion.div
        className="fixed inset-0 z-30 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed top-0 right-0 z-40 h-full w-full max-w-md bg-gradient-to-l from-gray-900/95 to-black/95 backdrop-blur-md shadow-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Detalhes da Memória
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Fechar painel"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
