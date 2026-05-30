'use client';

import { Pause, Play } from 'lucide-react';

interface AudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function AudioPlayer({ isPlaying, onTogglePlay }: AudioPlayerProps) {
  return (
    <button
      onClick={onTogglePlay}
      className="fixed z-30 flex items-center justify-center transition-all"
      style={{
        top: '16px',
        left: '16px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(17, 17, 17, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        color: 'var(--gold)',
      }}
      aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
    >
      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
    </button>
  );
}
