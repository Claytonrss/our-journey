'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { setPinValidated, setUseLocalAudio } = useAppStore();

  const showPinInput = hasSession || isSkipping;

  useEffect(() => {
    if (showPinInput && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [showPinInput]);

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

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (isError) setIsError(false);

    const newPin = pin.split('');
    newPin[index] = value;
    const updated = newPin.join('').slice(0, 4);
    setPin(updated);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-void)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 600px 600px at 50% 40%, rgba(212,175,55,0.12), transparent 70%)',
          animation: 'float-gradient 12s ease-in-out infinite',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{ opacity: 0.08 }}
      >
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke="var(--gold)"
            strokeWidth="0.5"
          />
          <circle
            cx="140"
            cy="140"
            r="80"
            stroke="var(--gold)"
            strokeWidth="0.5"
          />
          <line
            x1="140"
            y1="10"
            x2="140"
            y2="270"
            stroke="var(--gold)"
            strokeWidth="0.5"
          />
          <line
            x1="10"
            y1="140"
            x2="270"
            y2="140"
            stroke="var(--gold)"
            strokeWidth="0.5"
          />
          <line
            x1="45"
            y1="45"
            x2="235"
            y2="235"
            stroke="var(--gold)"
            strokeWidth="0.3"
          />
          <line
            x1="235"
            y1="45"
            x2="45"
            y2="235"
            stroke="var(--gold)"
            strokeWidth="0.3"
          />
          <polygon
            points="140,20 145,50 140,40 135,50"
            fill="var(--gold)"
            opacity="0.6"
          />
          <polygon
            points="140,260 145,230 140,240 135,230"
            fill="var(--gold)"
            opacity="0.4"
          />
          <polygon
            points="20,140 50,135 40,140 50,145"
            fill="var(--gold)"
            opacity="0.4"
          />
          <polygon
            points="260,140 230,135 240,140 230,145"
            fill="var(--gold)"
            opacity="0.4"
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8 text-center relative z-10"
      >
        <div className="space-y-3">
          <h1
            className="text-[38px] font-normal"
            style={{
              fontFamily: 'var(--font-playfair)',
              letterSpacing: '0.02em',
              color: 'var(--gold)',
              textShadow: '0 0 40px rgba(212,175,55,0.3)',
            }}
          >
            Our Journey
          </h1>
          <p
            className="text-sm italic"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--text-secondary)',
            }}
          >
            Uma história contada em lugares
          </p>
        </div>

        {!showPinInput ? (
          <div className="space-y-4 mt-8 flex flex-col items-center">
            <button
              onClick={() => signIn('spotify')}
              className="w-full py-3 px-4 text-black font-medium transition-all flex items-center justify-center gap-2"
              style={{
                background: '#1DB954',
                borderRadius: '14px',
                fontFamily: 'var(--font-inter)',
                fontSize: '15px',
              }}
            >
              Conectar com Spotify
            </button>
            <button
              onClick={() => setIsSkipping(true)}
              className="transition-colors underline underline-offset-4 text-sm mt-4"
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-inter)',
              }}
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
              <p
                className="text-xs text-center"
                style={{
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-inter)',
                  marginBottom: '16px',
                }}
              >
                código de acesso
              </p>

              <div
                className="flex justify-center gap-3"
                style={{
                  animation: isError ? 'shake 0.4s ease' : undefined,
                }}
              >
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="password"
                    maxLength={1}
                    value={pin[index] || ''}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isPending}
                    className="text-center text-2xl transition-all disabled:opacity-50"
                    style={{
                      width: '56px',
                      height: '64px',
                      borderRadius: '12px',
                      background: 'var(--bg-surface)',
                      border: isError
                        ? '1px solid rgba(220,80,80,0.6)'
                        : pin[index]
                          ? '1px solid var(--gold)'
                          : '1px solid rgba(212,175,55,0.2)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-inter)',
                      boxShadow: pin[index]
                        ? '0 0 0 3px rgba(212,175,55,0.1)'
                        : 'none',
                      outline: 'none',
                    }}
                  />
                ))}
              </div>

              {isError && (
                <p
                  className="text-sm"
                  style={{
                    color: 'rgba(220,80,80,0.8)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  Código incorreto.
                </p>
              )}

              <button
                type="submit"
                disabled={pin.length !== 4 || isPending}
                className="w-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #C9A227, #D4AF37)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0a0a0a',
                }}
              >
                {isPending ? 'Validando...' : 'Entrar'}
              </button>
            </form>
          </motion.div>
        )}

        <div className="flex flex-col items-center gap-3 mt-12">
          <div
            style={{
              width: '80px',
              height: '1px',
              background: 'rgba(212,175,55,0.2)',
            }}
          />
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '11px',
              color: 'var(--text-date)',
            }}
          >
            Apenas para nós dois
          </p>
        </div>
      </motion.div>
    </div>
  );
}
