'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
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
    // Seta a memória ativa (pro flyTo) e também seta como selecionada para já abrir o overlay
    setActiveMemoryId(memory.id);
    setSelectedMemoryId(memory.id);
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
        className="p-6 md:p-8 flex flex-col gap-6"
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
          className="group flex items-center gap-2 self-start mt-2 px-5 py-2.5 rounded-full transition-all"
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.15)',
          }}
        >
          <span
            className="text-[13px] font-medium tracking-wide transition-colors group-hover:text-white"
            style={{ color: 'var(--gold)' }}
          >
            Ver no mapa
          </span>
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
            style={{ color: 'var(--gold)' }}
          />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
