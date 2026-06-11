'use client';

import { motion, MotionValue } from 'framer-motion';

interface GoldLineProps {
  scrollYProgress: MotionValue<number>;
}

export function GoldLine({ scrollYProgress }: GoldLineProps) {
  return (
    <div className="absolute top-0 left-1/2 bottom-0 w-[1px] pointer-events-none z-0 -translate-x-1/2">
      {/* Trilha base discreta */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ background: 'rgba(212,175,55,0.06)' }}
      />

      {/* Linha animada principal */}
      <motion.div
        className="absolute top-0 w-full"
        style={{
          height: '100%',
          background: 'var(--gold)',
          opacity: 0.25,
          scaleY: scrollYProgress,
          transformOrigin: 'top',
        }}
      />
    </div>
  );
}
