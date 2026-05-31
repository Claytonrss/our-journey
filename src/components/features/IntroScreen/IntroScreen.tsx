'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Map, { MapRef } from 'react-map-gl/mapbox';
import { AnimatePresence, motion } from 'framer-motion';
import { memoryService } from '@/services/memoryService';
import type { Memory } from '@/types';

interface IntroScreenProps {
  onComplete: () => void;
}

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

const INTRO_CAMERA = {
  longitude: 10,
  latitude: 20,
  zoom: 1.5,
  pitch: 20,
  bearing: 0,
};

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const mapRef = useRef<MapRef>(null);
  const rotationRef = useRef<number>(0);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [introFadingOut, setIntroFadingOut] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  useEffect(() => {
    fetch('/api/mapbox-token')
      .then((res) => res.json())
      .then((data) => setMapboxToken(data.token))
      .catch(console.error);
  }, []);

  useEffect(() => {
    memoryService.getMemories().then((data) => setMemories(data));
  }, []);

  const startRotation = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const rotate = () => {
      map.setBearing(map.getBearing() + 0.08);
      rotationRef.current = requestAnimationFrame(rotate);
    };
    rotationRef.current = requestAnimationFrame(rotate);
  }, []);

  const stopRotation = useCallback(() => {
    cancelAnimationFrame(rotationRef.current);
  }, []);

  const handleLoad = useCallback(() => {
    setModalVisible(true);
    startRotation();
  }, [startRotation]);

  const handleButtonReady = useCallback(() => {
    setButtonVisible(true);
  }, []);

  const handleClick = useCallback(() => {
    stopRotation();
    setModalVisible(false);
    setButtonVisible(false);

    setTimeout(() => {
      const map = mapRef.current?.getMap();
      if (!map || memories.length === 0) return;

      const memory0 = memories[0];

      map.flyTo({
        center: [memory0.coordinates.lng, memory0.coordinates.lat],
        zoom: 13,
        pitch: 45,
        bearing: -15,
        duration: 7000,
        essential: true,
        easing: (t: number) => {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },
      });

      map.once('moveend', () => {
        sessionStorage.setItem('intro-seen', 'true');
        setIntroFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 800);
      });
    }, 500);
  }, [stopRotation, memories, onComplete]);

  if (!mapboxToken) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'var(--bg-void)' }}
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50"
      animate={{ opacity: introFadingOut ? 0 : 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <Map
        ref={mapRef}
        initialViewState={INTRO_CAMERA}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={mapboxToken}
        projection="globe"
        onLoad={handleLoad}
        attributionControl={false}
      />

      <AnimatePresence>
        {modalVisible && (
          <motion.div
            key="intro-modal"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
              delay: 0,
            }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[10%] md:bottom-[48px] px-6 md:px-0"
            style={{ width: 'min(480px, calc(100vw - 48px))' }}
          >
            <div
              className="w-full px-6 py-7 md:px-10 md:py-9"
              style={{
                background: 'rgba(17, 17, 17, 0.82)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                borderRadius: '24px',
                boxShadow:
                  '0 32px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(212,175,55,0.08)',
              }}
            >
              <p
                className="text-center uppercase tracking-[0.12em]"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '11px',
                  color: 'rgba(212, 175, 55, 0.6)',
                }}
              >
                nossa história, em lugares
              </p>

              <div
                style={{
                  width: '32px',
                  height: '1px',
                  background: 'rgba(212,175,55,0.25)',
                  margin: '14px auto 20px',
                }}
              />

              <div
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 'clamp(15px, 2vw, 17px)',
                  fontWeight: 400,
                  color: '#F5F0E8',
                  lineHeight: 1.85,
                  textAlign: 'center',
                }}
              >
                <p style={{ marginBottom: '20px' }}>
                  Da primeira vez que viajamos juntos até aqui — passamos por
                  muitos lugares, vivemos histórias que só nós dois sabemos.
                </p>
                <p>
                  Cada pin neste mapa é um pedaço nosso. E espero que a gente
                  marque muitos outros ainda.
                </p>
              </div>

              <div className="mt-8" style={{ height: '52px' }}>
                <AnimatePresence>
                  {!buttonVisible && (
                    <motion.div
                      key="spacer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onAnimationComplete={handleButtonReady}
                      className="h-full"
                    />
                  )}
                  {buttonVisible && (
                    <motion.button
                      key="button"
                      type="button"
                      onClick={handleClick}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, delay: 0 }}
                      className="w-full h-full"
                      style={{
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #C9A227, #D4AF37)',
                        fontFamily: 'var(--font-inter)',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#0a0a0a',
                        cursor: 'pointer',
                        border: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.88';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Vamos lá
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
