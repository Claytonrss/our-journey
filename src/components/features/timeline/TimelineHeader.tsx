'use client';

import { motion } from 'framer-motion';

interface TimelineHeaderProps {
  yearSpan: number;
}

export function TimelineHeader({ yearSpan }: TimelineHeaderProps) {
  return (
    <div className="pt-24 pb-8 text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="uppercase tracking-[0.12em]"
        style={{
          fontFamily: 'var(--font-playfair)',
          fontStyle: 'italic',
          fontSize: '13px',
          color: 'var(--gold)',
          opacity: 0.6,
        }}
      >
        Nossa história
      </motion.p>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        className="mx-auto"
        style={{
          width: '40px',
          height: '1px',
          background: 'var(--gold)',
          opacity: 0.4,
          margin: '12px auto 16px',
          transformOrigin: 'center',
        }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '14px',
          fontWeight: 300,
          color: 'var(--text-muted)',
          letterSpacing: '0.02em',
        }}
      >
        {yearSpan} anos ◆ muitos lugares
      </motion.p>
    </div>
  );
}
