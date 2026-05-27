'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Image as ImageType } from '@/types';

interface MasonryGalleryProps {
  images: ImageType[];
}

export function MasonryGallery({ images }: MasonryGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        Nenhuma imagem disponível
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 md:gap-3">
      {images.map((image, index) => (
        <GalleryImage key={index} image={image} />
      ))}
    </div>
  );
}

interface GalleryImageProps {
  image: ImageType;
}

function GalleryImage({ image }: GalleryImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className="bg-gray-800 rounded-lg flex items-center justify-center"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        <span className="text-gray-600 text-xs">Erro</span>
      </div>
    );
  }

  return (
    <Image
      src={image.url}
      alt={image.alt}
      width={image.width}
      height={image.height}
      className="w-full h-auto rounded-lg object-cover"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
