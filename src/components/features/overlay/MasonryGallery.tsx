'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Image as ImageType } from '@/types';

interface MasonryGalleryProps {
  images: ImageType[];
}

const HEIGHTS = [140, 120, 96, 120];

export function MasonryGallery({ images }: MasonryGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-32"
        style={{
          fontFamily: 'var(--font-inter)',
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
        className="flex overflow-x-auto"
        style={{
          gap: '6px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {images.map((image, index) => (
          <GalleryImage
            key={index}
            image={image}
            height={HEIGHTS[index % HEIGHTS.length]}
            onClick={() => setSelectedIndex(index)}
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
            fontFamily: 'var(--font-inter)',
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
        width: `${height * 0.8}px`,
        borderRadius: '12px',
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
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
        zIndex: 50,
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 p-2 transition-colors"
        style={{
          color: 'var(--text-secondary)',
          zIndex: 52,
          background: 'rgba(24,24,24,0.6)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
          className="absolute left-4 p-2 transition-colors"
          style={{
            color: 'var(--text-secondary)',
            zIndex: 52,
            background: 'rgba(24,24,24,0.6)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
          className="absolute right-4 p-2 transition-colors"
          style={{
            color: 'var(--text-secondary)',
            zIndex: 52,
            background: 'rgba(24,24,24,0.6)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="max-w-full max-h-full object-contain select-none"
            style={{ borderRadius: '8px' }}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <div
          className="absolute bottom-8 left-0 right-0 text-center"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            zIndex: 52,
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </motion.div>
  );
}
