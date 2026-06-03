'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Image as ImageType } from '@/types';

interface MasonryGalleryProps {
  images: ImageType[];
  startIndex?: number;
}

const HEIGHTS = [130, 105];

export function MasonryGallery({
  images,
  startIndex = 0,
}: MasonryGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const displayImages = images.slice(startIndex);

  if (images.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-32"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}
      >
        Nenhuma imagem disponível
      </div>
    );
  }

  return (
    <>
      <div
        className="flex overflow-x-auto pb-4"
        style={{
          gap: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {displayImages.map((image, index) => (
          <GalleryImage
            key={index}
            image={image}
            height={HEIGHTS[index % HEIGHTS.length]}
            onClick={() => setSelectedIndex(startIndex + index)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            images={images}
            currentIndex={selectedIndex}
            onClose={() => setSelectedIndex(null)}
            onNavigate={setSelectedIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface GalleryImageProps {
  image: ImageType;
  height: number;
  onClick: () => void;
}

function GalleryImage({ image, height, onClick }: GalleryImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          height: `${height}px`,
          width: `${height * 0.8}px`,
          borderRadius: '12px',
          background: 'var(--bg-surface)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: 'var(--text-date)',
          }}
        >
          Erro
        </span>
      </div>
    );
  }

  return (
    <motion.div
      className="relative shrink-0 overflow-hidden cursor-pointer"
      style={{
        height: `${height}px`,
        width: `${height * 0.85}px`,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
    >
      <Image
        src={image.url}
        alt={image.alt}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </motion.div>
  );
}

interface LightboxProps {
  images: ImageType[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > 100) {
        onClose();
        return;
      }

      if (Math.abs(info.offset.x) > 80) {
        if (info.offset.x < 0 && currentIndex < images.length - 1) {
          onNavigate(currentIndex + 1);
        } else if (info.offset.x > 0 && currentIndex > 0) {
          onNavigate(currentIndex - 1);
        }
      }
    },
    [currentIndex, images.length, onClose, onNavigate],
  );

  const goPrev = () => {
    if (currentIndex > 0) onNavigate(currentIndex - 1);
  };

  const goNext = () => {
    if (currentIndex < images.length - 1) onNavigate(currentIndex + 1);
  };

  const image = images[currentIndex];

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 100,
        background: 'rgba(4,4,4,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      onClick={onClose}
    >
      <div className="absolute top-0 left-0 right-0 h-[10vh] bg-black/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[10vh] bg-black/40 pointer-events-none" />
      <button
        className="absolute top-6 right-6 p-2 transition-colors hover:bg-white/10"
        style={{
          color: 'var(--text-primary)',
          zIndex: 102,
          background: 'rgba(24,24,24,0.8)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Fechar foto"
      >
        <X size={20} />
      </button>

      {images.length > 1 && currentIndex > 0 && (
        <button
          className="absolute left-6 p-2 transition-colors hover:bg-white/10"
          style={{
            color: 'var(--text-primary)',
            zIndex: 102,
            background: 'rgba(24,24,24,0.8)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Foto anterior"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {images.length > 1 && currentIndex < images.length - 1 && (
        <button
          className="absolute right-6 p-2 transition-colors hover:bg-white/10"
          style={{
            color: 'var(--text-primary)',
            zIndex: 102,
            background: 'rgba(24,24,24,0.8)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Próxima foto"
        >
          <ChevronRight size={20} />
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="relative w-full h-full flex items-center justify-center p-8"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="object-contain select-none shadow-2xl"
            style={{
              maxWidth: '90vw',
              maxHeight: '75vh',
              borderRadius: '6px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            }}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <div
          className="absolute bottom-6 left-0 right-0 text-center"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            color: 'var(--gold)',
            zIndex: 102,
            letterSpacing: '0.05em',
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </motion.div>
  );
}
