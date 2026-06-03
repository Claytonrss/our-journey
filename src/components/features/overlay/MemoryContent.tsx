'use client';

import type { Memory } from '@/types';

interface MemoryContentProps {
  memory: Memory;
  hideTitle?: boolean;
}

export function MemoryContent({
  memory,
  hideTitle = false,
}: MemoryContentProps) {
  const formattedDate = new Date(memory.date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-0">
      {!hideTitle && (
        <>
          <p
            className="italic"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '12px',
              color: 'var(--text-date)',
              marginBottom: '8px',
            }}
          >
            {formattedDate}
          </p>

          <h2
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '26px',
              fontWeight: 400,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}
          >
            {memory.isSpecialPin && (
              <span style={{ color: 'var(--gold)', marginRight: '6px' }}>
                ◆
              </span>
            )}
            {memory.title}
          </h2>

          <div
            style={{
              width: '40px',
              height: '1px',
              background: 'var(--gold)',
              opacity: 0.4,
              margin: '12px 0',
            }}
          />
        </>
      )}

      <div className="relative">
        <p
          className="line-clamp-4"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          {memory.description}
        </p>
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--bg-panel))',
          }}
        />
      </div>
    </div>
  );
}
