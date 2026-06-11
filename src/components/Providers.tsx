'use client';

import { SessionProvider } from 'next-auth/react';
import { GlobalAudio } from '@/components/GlobalAudio';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GlobalAudio />
      {children}
    </SessionProvider>
  );
}
