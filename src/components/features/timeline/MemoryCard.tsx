'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/hooks/useAppStore';
import { CardPhotoHero } from './CardPhotoHero';
import { CardPhotoStrip } from './CardPhotoStrip';
import type { Memory } from '@/types';

interface MemoryCardProps {
  memory: Memory;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { setActiveMemoryId, setSelectedMemoryId } = useAppStore();
  const router = useRouter();

  const handleNavigateToMap = () => {
    // Seta a memória ativa para o flyTo no mapa
    setActiveMemoryId(memory.id);
    router.push('/map');
  };

  const extraImages = memory.images.slice(1);

  return (
    <motion.div
      id={`memory-card-${memory.id}`}
      data-memory-id={memory.id}
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col mb-10 rounded-2xl"
      style={{
        background: 'var(--bg-panel)',
        border: memory.isSpecialPin
          ? '1px solid rgba(212,175,55,0.2)'
          : '1px solid rgba(255,255,255,0.04)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <CardPhotoHero memory={memory} cardRef={cardRef} />

      {/* Separador sutil */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.15)] to-transparent" />

      <motion.div
        className="p-6 md:p-8 flex flex-col gap-3"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.3 },
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
          className="text-[14px] leading-relaxed"
          style={{
            fontFamily: 'var(--font-ui)',
            color: 'var(--text-secondary)',
          }}
        >
          {memory.description}
        </motion.p>

        {extraImages.length > 0 && (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <CardPhotoStrip images={extraImages} />
          </motion.div>
        )}

        <motion.button
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
          onClick={handleNavigateToMap}
          className="group flex items-center gap-1 self-start mt-2 text-[13px] transition-all"
          style={{
            color: 'var(--gold)',
            fontFamily: 'var(--font-ui)',
            letterSpacing: '0.02em',
            opacity: 0.7,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <span className="group-hover:opacity-100 transition-opacity">
            Ver no mapa
          </span>
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
