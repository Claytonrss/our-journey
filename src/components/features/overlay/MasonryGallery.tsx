'use client';

import { CldImage } from 'next-cloudinary';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbox } from './Lightbox';
import type { Image as ImageType } from '@/types';

interface MasonryGalleryProps {
  images: ImageType[];
  startIndex?: number;
}

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
        className="grid grid-cols-2"
        style={{
          gap: '8px',
        }}
      >
        {displayImages.map((image, index) => (
          <GalleryImage
            key={index}
            image={image}
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
  onClick: () => void;
}

function GalleryImage({ image, onClick }: GalleryImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
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
      className="relative overflow-hidden cursor-pointer"
      style={{
        width: '100%',
        aspectRatio: '4 / 3',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
    >
      {isLoading && (
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s linear infinite',
          }}
        />
      )}
      <CldImage
        src={image.publicId}
        alt={image.alt}
        fill
        className="object-cover"
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
        sizes="(max-width: 768px) 50vw, 200px"
        crop="fill"
        gravity="auto"
        dpr="auto"
      />
    </motion.div>
  );
}
