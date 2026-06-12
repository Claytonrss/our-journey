'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useAppStore } from '@/hooks/useAppStore';
import { validatePin } from '@/app/actions/auth';
import { CompassRose } from '@/components/ui/CompassRose';
import Map from 'react-map-gl/mapbox';

interface LockScreenProps {
  hasSession: boolean;
}

const STORAGE_KEY = 'our-journey-audio-preference';

const PIN_PATTERNS = [
  { regex: /^\d9\d9$/, message: 'Errado! Sabia que você ia tentar a padrão.' },
  { regex: /^1\d{2}5$/, message: 'Erro :( É uma data mais específica.' },
  {
    regex: /^0\d{2}9$/,
    message: 'Errou! Não é o aniversário de uma pessoa.',
  },
  {
    regex: /^0\d{2}0$/,
    message: 'Nops... Tente de novo.',
  },
  {
    regex: /^(0000|1234|1111|9999|1212|2020|2026)$/,
    message: 'Sério? Essa é a primeira que todo mundo tenta.',
  },
];

const RANDOM_ERRORS = [
  'Errou feio, errou rude.',
  'Tente outra vez...',
  'Essa não é a nossa data...',
  'Hmm... acho que não.',
  'Memória falhando?',
  'Não foi dessa vez.',
  'Ops! Continue tentando',
];

export function LockScreen({ hasSession }: LockScreenProps) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [audioMode, setAudioMode] = useState<'local' | 'spotify'>(() => {
    if (hasSession) return 'spotify';
    if (typeof window === 'undefined') return 'local';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'spotify') return 'spotify';
    if (saved === 'local') return 'local';
    return 'local';
  });

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { setPinValidated, setUseLocalAudio } = useAppStore();

  const showPin = showPinInput || hasSession;

  useEffect(() => {
    fetch('/api/mapbox-token')
      .then((res) => res.json())
      .then((data) => setMapboxToken(data.token))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (showPin && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [showPin]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;

    startTransition(async () => {
      const isValid = await validatePin(pin);
      if (isValid) {
        localStorage.setItem(STORAGE_KEY, audioMode);
        setPinValidated(true);
        setUseLocalAudio(audioMode === 'local');
        setIsUnlocking(true);
        setTimeout(() => {
          router.push('/map');
        }, 800);
      } else {
        setIsError(true);
        const matched = PIN_PATTERNS.find((p) => p.regex.test(pin));
        if (matched) {
          setErrorMessage(matched.message);
        } else {
          const randomMsg =
            RANDOM_ERRORS[Math.floor(Math.random() * RANDOM_ERRORS.length)];
          setErrorMessage(randomMsg);
        }
        setPin('');
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 0);
      }
    });
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (isError) {
      setIsError(false);
      setErrorMessage('');
    }

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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-void">
      {mapboxToken && (
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000"
          style={{ opacity: isUnlocking ? 1 : 0.01 }}
        >
          <Map
            initialViewState={{
              longitude: 10,
              latitude: 20,
              zoom: 1.5,
              pitch: 20,
              bearing: 0,
            }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={mapboxToken}
            projection="globe"
            attributionControl={false}
          />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <CompassRose size={360} opacity={0.15} className="compass-rotate" />
      </div>

      <AnimatePresence>
        {!isUnlocking && (
          <motion.div
            key="lock-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-secondary)',
                }}
              >
                Uma história contada em lugares
              </p>
            </div>

            {!showPin ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 space-y-6"
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="flex items-center p-1 rounded-full relative"
                    style={{
                      background: 'rgba(212, 175, 55, 0.05)',
                      border: '1px solid rgba(212, 175, 55, 0.15)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setAudioMode('local')}
                      className="px-5 py-2 rounded-full text-[11px] uppercase tracking-wider transition-all duration-300 relative"
                      style={{
                        fontFamily: 'var(--font-ui)',
                        color:
                          audioMode === 'local'
                            ? '#080808'
                            : 'var(--text-secondary)',
                        fontWeight: audioMode === 'local' ? 500 : 400,
                      }}
                    >
                      {audioMode === 'local' && (
                        <motion.div
                          layoutId="audioModePill"
                          className="absolute inset-0 rounded-full"
                          style={{ background: 'var(--gold)' }}
                        />
                      )}
                      <span className="relative z-10">Áudio Local</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioMode('spotify')}
                      className="px-5 py-2 rounded-full text-[11px] uppercase tracking-wider transition-all duration-300 relative"
                      style={{
                        fontFamily: 'var(--font-ui)',
                        color:
                          audioMode === 'spotify'
                            ? '#1DB954'
                            : 'var(--text-secondary)',
                        fontWeight: audioMode === 'spotify' ? 500 : 400,
                      }}
                    >
                      {audioMode === 'spotify' && (
                        <motion.div
                          layoutId="audioModePill"
                          className="absolute inset-0 rounded-full"
                          style={{ background: 'rgba(29, 185, 84, 0.1)' }}
                        />
                      )}
                      <span className="relative z-10">Spotify</span>
                    </button>
                  </div>
                </div>

                {hasSession ? (
                  <button
                    type="button"
                    onClick={() => setShowPinInput(true)}
                    className="btn-primary"
                  >
                    Continuar
                  </button>
                ) : audioMode === 'spotify' ? (
                  <button
                    type="button"
                    onClick={() => signIn('spotify')}
                    className="btn-primary"
                  >
                    Conectar com Spotify
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPinInput(true)}
                    className="btn-primary"
                  >
                    Continuar Offline
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handlePinSubmit}
                className="space-y-6"
              >
                <p
                  className="text-xs tracking-widest text-center"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--text-secondary)',
                    opacity: 0.8,
                  }}
                >
                  Antes de iniciar,
                  <br />
                  você precisa descobrir o código secreto.
                </p>
                <div
                  role="group"
                  aria-label="Código PIN de 4 dígitos"
                  className="flex justify-center gap-3"
                  style={{
                    animation: isError ? 'shake 0.4s ease' : undefined,
                  }}
                >
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="relative flex items-center justify-center"
                    >
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        id={`pin-${index}`}
                        type="password"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={pin[index] || ''}
                        aria-label={`Dígito ${index + 1} de 4`}
                        aria-invalid={isError || undefined}
                        onChange={(e) =>
                          handleDigitChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        disabled={isPending}
                        className="text-center text-2xl transition-all disabled:opacity-50 relative z-10"
                        style={{
                          width: '60px',
                          height: '68px',
                          borderRadius: '12px',
                          background: 'var(--bg-surface)',
                          border: isError
                            ? '1px solid rgba(220,80,80,0.6)'
                            : pin[index]
                              ? '1px solid var(--gold)'
                              : '1px solid rgba(212,175,55,0.2)',
                          color: 'transparent',
                          fontFamily: 'var(--font-ui)',
                          boxShadow:
                            focusedIndex === index
                              ? '0 0 0 3px rgba(212,175,55,0.25)'
                              : pin[index]
                                ? '0 0 0 3px rgba(212,175,55,0.1)'
                                : 'none',
                          outline: 'none',
                          caretColor: 'transparent',
                        }}
                      />
                      <AnimatePresence>
                        {focusedIndex === index && !pin[index] && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute pointer-events-none z-20 flex items-center justify-center inset-0"
                            style={{
                              color: 'var(--gold)',
                              fontSize: '24px',
                              fontFamily: 'var(--font-ui)',
                              fontWeight: 300,
                              animation: 'cursor-blink 1s steps(2) infinite',
                            }}
                          >
                            |
                          </motion.span>
                        )}
                        {pin[index] && (
                          <motion.span
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 25,
                            }}
                            className="absolute pointer-events-none z-20 text-xl flex items-center justify-center inset-0"
                            style={{ color: 'var(--gold)' }}
                          >
                            ◆
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
                {isError && (
                  <p role="alert" className="text-sm text-red-500">
                    {errorMessage}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pin.length !== 4 || isPending}
                  className="btn-primary"
                >
                  {isPending ? 'Validando...' : 'Entrar'}
                </button>
              </motion.form>
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
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  color: 'var(--text-date)',
                }}
              >
                Por onde for, quero ser seu par.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
