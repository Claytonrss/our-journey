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
        aria-label={`Ver memória${memory.isSpecialPin ? ' especial' : ''}: ${memory.title}`}
      >
        {memory.isSpecialPin ? (
          <SpecialPinSVG isActive={isActive} />
        ) : (
          <DefaultPinSVG isActive={isActive} />
        )}

        {isActive && (
          <span
            className="mt-2 whitespace-nowrap italic"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              background: 'rgba(8,8,8,0.72)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '8px',
              padding: '5px 14px',
              boxShadow: 'none',
              border: 'none',
            }}
          >
            {memory.title}
          </span>
        )}
      </button>
    </Marker>
  );
});
