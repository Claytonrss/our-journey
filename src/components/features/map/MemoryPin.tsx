'use client';

import React from 'react';
import { Marker } from 'react-map-gl/mapbox';
import type { Memory } from '@/types';
import { DefaultPinSVG } from './DefaultPinSVG';
import { SpecialPinSVG } from './SpecialPinSVG';

interface MemoryPinProps {
  memory: Memory;
  isActive: boolean;
  onClick: (id: string) => void;
}

export const MemoryPin = React.memo(function MemoryPin({
  memory,
  isActive,
  onClick,
}: MemoryPinProps) {
  const { lat, lng } = memory.coordinates;
  const [showHint, setShowHint] = React.useState(false);

  React.useEffect(() => {
    if (isActive) {
      const hasClicked = sessionStorage.getItem('hasClickedPin');
      if (!hasClicked) {
        setShowHint(true);
      } else {
        setShowHint(false);
      }
    }
  }, [isActive]);

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        sessionStorage.setItem('hasClickedPin', 'true');
        setShowHint(false);
        onClick(memory.id);
      }}
    >
      <button
        className="flex flex-col items-center transition-all duration-500 relative group cursor-pointer"
        style={{
          filter: isActive
            ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))'
            : 'drop-shadow(0 0 3px rgba(212, 175, 55, 0.2))',
        }}
        aria-label={`Ver memória${memory.isSpecialPin ? ' especial' : ''}: ${memory.title}`}
      >
        {isActive && (
          <div className="absolute top-2 w-8 h-8 -z-10 rounded-full bg-[rgba(212,175,55,0.4)] animate-ping" />
        )}

        {memory.isSpecialPin ? (
          <SpecialPinSVG isActive={isActive} />
        ) : (
          <DefaultPinSVG isActive={isActive} />
        )}

        {isActive && (
          <div className="mt-2 flex flex-col items-center">
            <div
              className="flex items-center gap-3 whitespace-nowrap group-hover:bg-black/90 transition-colors"
              style={{
                background: 'rgba(8,8,8,0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '24px',
                padding: '6px 8px 6px 16px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              }}
            >
              <span
                className="italic"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                {memory.title}
              </span>
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full"
                style={{ background: 'rgba(212, 175, 55, 0.15)' }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(212, 175, 55, 0.9)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            {showHint && (
              <span
                className="text-[9px] uppercase tracking-[0.2em] mt-2 font-medium"
                style={{ color: 'rgba(212, 175, 55, 0.8)' }}
              >
                Toque para abrir
              </span>
            )}
          </div>
        )}
      </button>
    </Marker>
  );
});
