'use client';

import React from 'react';

interface SpecialPinSVGProps {
  isActive: boolean;
}

export const SpecialPinSVG = React.memo(function SpecialPinSVG({
  isActive,
}: SpecialPinSVGProps) {
  const size = isActive ? 48 : 36;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-500"
      style={{
        animation: 'heart-glow 3s ease-in-out infinite',
      }}
    >
      {/* Heart shape */}
      <path
        d="M18 31.5C18 31.5 3 22.5 3 13.5C3 7.5 7.5 3 13.5 3C15.9 3 18 4.2 18 6C18 4.2 20.1 3 22.5 3C28.5 3 33 7.5 33 13.5C33 22.5 18 31.5 18 31.5Z"
        fill="var(--gold)"
        stroke="rgba(180,150,50,0.6)"
        strokeWidth={1}
      />
      {/* Highlight for depth */}
      <path
        d="M13.5 6C10.5 6 7.5 8.5 7.5 12C7.5 13.5 8.5 15 9.5 16"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
});
