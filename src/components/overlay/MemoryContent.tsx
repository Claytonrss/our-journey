'use client';

import { Heart } from 'lucide-react';
import type { Memory } from '@/types';

interface MemoryContentProps {
  memory: Memory;
}

export function MemoryContent({ memory }: MemoryContentProps) {
  const formattedDate = new Date(memory.date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-serif text-[var(--color-brand-gold)]">
            {memory.title}
          </h2>
          {memory.isSpecialPin && (
            <Heart
              size={20}
              className="text-[var(--color-brand-rose)]"
              fill="currentColor"
            />
          )}
        </div>
        <p className="text-sm text-gray-400 italic">{formattedDate}</p>
      </div>

      <p className="text-gray-300 leading-relaxed">{memory.description}</p>
    </div>
  );
}
