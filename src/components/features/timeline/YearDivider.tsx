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
      className="relative flex items-center justify-between py-12 mb-6"
    >
      {/* Dot posicionado na GoldLine (usando margem negativa baseada no padding do pai) */}
      <motion.div className="absolute left-[-20px] md:left-[-30px] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
        <motion.div
          whileInView={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: 'var(--gold)' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--gold)', opacity: 0.4 }}
        />
      </motion.div>

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
