'use client';

import { motion } from 'framer-motion';
import { CompassRose } from '@/components/ui/CompassRose';

interface HeadphonesScreenProps {
  onComplete: () => void;
}

export function HeadphonesScreen({ onComplete }: HeadphonesScreenProps) {
  const handleProceed = () => {
    sessionStorage.setItem('headphones-seen', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-void select-none">
      {/* Background Rotating Compass Rose */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <CompassRose size={380} opacity={0.15} className="compass-rotate" />
      </div>

      {/* Main Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -24, scale: 0.95, filter: 'blur(10px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-md w-full px-8 py-10 text-center z-10"
        style={{
          background: 'rgba(16, 16, 16, 0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          borderRadius: '24px',
          boxShadow:
            '0 32px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(212,175,55,0.08)',
        }}
      >
        {/* Animated Headphones SVG Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.95, 1.05, 0.95],
            opacity: 1,
          }}
          transition={{
            scale: {
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            },
            opacity: { duration: 0.6 },
          }}
          className="flex justify-center mb-8"
        >
          <div
            className="p-5 rounded-full flex items-center justify-center relative"
            style={{
              background: 'rgba(212, 175, 55, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.15)',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              fill="currentColor"
              className="text-gold pointer-events-none"
              viewBox="0 0 16 16"
              style={{ color: 'var(--gold)' }}
            >
              <path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 1 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5" />
            </svg>
          </div>
        </motion.div>

        {/* Heading */}
        <h2
          className="text-2xl font-normal mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.02em',
            color: 'var(--gold)',
            textShadow: '0 0 30px rgba(212,175,55,0.2)',
          }}
        >
          Prepare-se para a viagem
        </h2>

        {/* Content Description */}
        <p
          className="text-[15px] mb-8 leading-relaxed"
          style={{
            fontFamily: 'var(--font-editorial)',
            color: 'var(--text-warm)',
            opacity: 0.85,
          }}
        >
          Coloque os fones de ouvido. Nossa história é contada também em sons e
          músicas.
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleProceed}
          className="btn-primary overflow-hidden relative group"
        >
          <span className="relative z-10">Estou pronta</span>
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent" />
        </button>
      </motion.div>
    </div>
  );
}
