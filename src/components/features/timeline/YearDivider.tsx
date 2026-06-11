'use client';

import { motion } from 'framer-motion';

interface YearDividerProps {
  year: number;
}

export function YearDivider({ year }: YearDividerProps) {
  return (
    <motion.div
      initial={{ x: -16, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative flex items-center justify-between py-8 mb-4"
    >
      {/* Linha tracejada à esquerda */}
      <div
        className="flex-1 h-[1px]"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(212,175,55,0.2) 50%, rgba(212,175,55,0.2) 100%)',
        }}
      />

      <span
        className="mx-6 select-none"
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(32px, 5vw, 48px)',
          color: 'rgba(212,175,55,0.45)',
          lineHeight: 1,
          textShadow: '0 2px 16px rgba(212,175,55,0.15)',
        }}
      >
        {year}
      </span>

      {/* Linha tracejada à direita */}
      <div
        className="flex-1 h-[1px]"
        style={{
          background:
            'linear-gradient(to left, transparent, rgba(212,175,55,0.2) 50%, rgba(212,175,55,0.2) 100%)',
        }}
      />
    </motion.div>
  );
}
