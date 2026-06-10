'use client';

import { CldImage } from 'next-cloudinary';
import { motion } from 'framer-motion';
import type { Image as ImageType } from '@/types';

interface CardPhotoStripProps {
  images: ImageType[];
}

export function CardPhotoStrip({ images }: CardPhotoStripProps) {
  if (images.length === 0) return null;

  return (
    <div className="w-full mt-4 pb-2">
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 pt-1 px-1">
        {images.map((image, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative shrink-0 cursor-pointer overflow-hidden rounded-lg shadow-md"
            style={{
              width: '120px',
              aspectRatio: '4/3',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <CldImage
              src={image.publicId}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="120px"
              crop="fill"
              gravity="auto"
              dpr="auto"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
