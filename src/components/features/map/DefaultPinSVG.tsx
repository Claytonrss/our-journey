'use client';

import React from 'react';

interface DefaultPinSVGProps {
  isActive: boolean;
}

export const DefaultPinSVG = React.memo(function DefaultPinSVG({
  isActive,
}: DefaultPinSVGProps) {
  return (
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
  );
});
