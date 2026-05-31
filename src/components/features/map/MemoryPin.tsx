'use client';

import React from 'react';
import { Marker } from 'react-map-gl/mapbox';
import type { Memory } from '@/types';

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

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(memory.id);
      }}
    >
      <button
        className="flex flex-col items-center transition-all duration-500 relative"
        style={{
          filter: isActive
            ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))'
            : 'drop-shadow(0 0 3px rgba(212, 175, 55, 0.2))',
        }}
        aria-label={`Ver memória: ${memory.title}`}
      >
        {memory.isSpecialPin && (
          <span
            className="absolute rounded-full"
            style={{
              width: '36px',
              height: '36px',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              border: '2px solid var(--gold)',
              animation: 'pulse-ring 2s ease-out infinite',
            }}
          />
        )}

        <svg
          width={isActive ? 40 : 32}
          height={isActive ? 44 : 36}
          viewBox="0 0 32 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-500"
        >
          <path
            d="M16 0C8.268 0 2 6.268 2 14c0 7.5 14 26 14 26s14-18.5 14-26C30 6.268 23.732 0 16 0Z"
            fill="var(--gold)"
            stroke="rgba(180,150,50,0.6)"
            strokeWidth={0.5}
          />
          <circle cx="16" cy="14" r="4" fill="white" opacity={0.9} />
        </svg>

        {isActive && (
          <span
            className="mt-1 whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              background: 'rgba(10,10,10,0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '8px',
              padding: '4px 12px',
            }}
          >
            {memory.title}
          </span>
        )}
      </button>
    </Marker>
  );
});
