'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  bottomOffset?: string;
  mobileTopOffset?: string;
}

export function ViewToggle({
  bottomOffset = '24px',
  mobileTopOffset = '12px',
}: ViewToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  const isTimeline = pathname?.includes('/timeline');

  return (
    <motion.div
      initial={{ y: isMobile ? -12 : 12, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-1/2 z-20 flex items-center p-1"
      style={{
        ...(isMobile
          ? {
              top: `calc(env(safe-area-inset-top, 0px) + ${mobileTopOffset})`,
            }
          : { bottom: bottomOffset }),
        background: 'rgba(17, 17, 17, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--gold-line)',
        borderRadius: '99px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <button
        onClick={() => router.push('/map')}
        className={cn(
          'px-5 py-2 text-[13px] transition-all duration-300 rounded-full font-medium tracking-wide',
          !isTimeline
            ? 'bg-[var(--gold-dim)] text-[var(--gold)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        )}
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        Mapa
      </button>
      <button
        onClick={() => router.push('/timeline')}
        className={cn(
          'px-5 py-2 text-[13px] transition-all duration-300 rounded-full font-medium tracking-wide',
          isTimeline
            ? 'bg-[var(--gold-dim)] text-[var(--gold)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        )}
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        Linha do tempo
      </button>
    </motion.div>
  );
}
