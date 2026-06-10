'use client';

import { motion } from 'framer-motion';

export function TimelineEndNote() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 1.2, ease: 'easeIn' }}
      className="pb-36 pt-8"
    >
      <div
        style={{
          width: '1px',
          height: '40px',
          background: 'var(--gold)',
          opacity: 0.18,
          marginBottom: '24px',
        }}
      />
      <p
        style={{
          fontFamily: 'var(--font-playfair)',
          fontStyle: 'italic',
          fontSize: '14px',
          color: 'var(--text-muted)',
        }}
      >
        E ainda tem tanto pela frente.
      </p>
    </motion.div>
  );
}
