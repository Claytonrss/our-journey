'use client';

import React from 'react';
import { CldImage } from 'next-cloudinary';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Memory } from '@/types';

interface CardPhotoHeroProps {
  memory: Memory;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export function CardPhotoHero({ memory, cardRef }: CardPhotoHeroProps) {
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  // Efeito Parallax
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '15%']);

  const heroImage = memory.images[0];
  if (!heroImage) return null;

  return (
    <div
      className="relative w-full overflow-hidden shrink-0 rounded-t-2xl"
      style={{ height: 'clamp(140px, 30vw, 200px)' }}
    >
      <motion.div className="absolute inset-0 w-full h-[120%]" style={{ y }}>
        <CldImage
          src={heroImage.publicId}
          alt={heroImage.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 640px"
          crop="fill"
          gravity="auto"
          dpr="auto"
        />
      </motion.div>

      {/* Gradient inferior para o texto */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 30%, rgba(16,16,16,0.6) 70%, rgba(16,16,16,1) 100%)',
        }}
      />

      <div className="absolute bottom-4 left-6 right-6 z-10 flex flex-col">
        <motion.span
          className="italic drop-shadow-md"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '11px',
            color: 'var(--gold)',
            marginBottom: '4px',
          }}
        >
          {new Date(memory.date).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
          })}
        </motion.span>

        <motion.h3
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '18px',
            fontWeight: 400,
            color: 'var(--text-primary)',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            lineHeight: 1.2,
          }}
        >
          {memory.isSpecialPin && (
            <span style={{ color: 'var(--gold)', marginRight: '6px' }}>◆</span>
          )}
          {memory.title}
        </motion.h3>
      </div>
    </div>
  );
}
