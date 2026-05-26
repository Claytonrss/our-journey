'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useAppStore } from '@/hooks/useAppStore';
import { validatePin } from '@/app/actions/auth';

interface LockScreenProps {
  hasSession: boolean;
}

export function LockScreen({ hasSession }: LockScreenProps) {
  const router = useRouter();
  const [isSkipping, setIsSkipping] = useState(false);
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { setPinValidated, setUseLocalAudio } = useAppStore();

  const showPinInput = hasSession || isSkipping;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;

    startTransition(async () => {
      const isValid = await validatePin(pin);
      if (isValid) {
        setPinValidated(true);
        if (isSkipping || !hasSession) {
          setUseLocalAudio(true);
        }
        router.push('/map');
      } else {
        setIsError(true);
        setPin('');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <h1 className="text-4xl font-serif text-[var(--color-brand-gold)]">
          Our Journey
        </h1>

        {!showPinInput ? (
          <div className="space-y-4 mt-8 flex flex-col items-center">
            <button
              onClick={() => signIn('spotify')}
              className="w-full py-3 px-4 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-colors flex items-center justify-center gap-2"
            >
              Conectar com Spotify
            </button>
            <button
              onClick={() => setIsSkipping(true)}
              className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 text-sm mt-4"
            >
              Entrar sem Spotify (Offline)
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <p className="text-gray-300">Insira o código de acesso</p>

              <motion.div
                animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    if (isError) setIsError(false);
                  }}
                  disabled={isPending}
                  className={`w-32 text-center text-3xl tracking-widest bg-transparent border-b-2 ${
                    isError
                      ? 'border-red-500 text-red-500'
                      : 'border-gray-500 text-white'
                  } focus:outline-none focus:border-[var(--color-brand-gold)] transition-colors py-2`}
                  autoFocus
                />
              </motion.div>

              {isError && (
                <p className="text-red-500 text-sm">Código incorreto.</p>
              )}

              <button
                type="submit"
                disabled={pin.length !== 4 || isPending}
                className="w-full py-3 px-4 bg-[var(--color-brand-gold)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-full transition-all"
              >
                {isPending ? 'Validando...' : 'Entrar'}
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
