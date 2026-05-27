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

  const pinFill = memory.isSpecialPin ? '#d4a853' : '#e8a598';
  const pinStroke = memory.isSpecialPin ? '#b8912f' : '#c47d6e';

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
        className="flex flex-col items-center transition-all duration-500"
        style={{
          animation: isActive ? 'pin-pulse 2s ease-in-out infinite' : undefined,
          filter: isActive
            ? undefined
            : 'drop-shadow(0 0 3px rgba(212, 168, 83, 0.3))',
        }}
        aria-label={`Ver memória: ${memory.title}`}
      >
        <svg
          width={isActive ? 44 : 32}
          height={isActive ? 54 : 40}
          viewBox="0 0 32 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-500"
        >
          <path
            d="M16 0C8.268 0 2 6.268 2 14c0 5.02 2.327 9.646 6 13.09V40l8-6 8 6V27.09C27.673 23.646 30 19.02 30 14 30 6.268 23.732 0 16 0Z"
            fill={pinFill}
            stroke={pinStroke}
            strokeWidth={0.5}
          />
          <path
            d="M16 8c-1.77 0-3.2 1.43-3.2 3.2 0 .87.35 1.66.91 2.24l.59.56.01.01L16 15.9l1.69-1.89.01-.01.59-.56c.56-.58.91-1.37.91-2.24C19.2 9.43 17.77 8 16 8Z"
            fill={memory.isSpecialPin ? '#2d1b0e' : '#fff'}
            opacity={memory.isSpecialPin ? 0.6 : 0.9}
          />
        </svg>

        {isActive && (
          <span className="mt-1 text-[10px] font-medium text-[var(--color-brand-gold)] tracking-wide uppercase bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
            {memory.title}
          </span>
        )}
      </button>
    </Marker>
  );
});
