'use client';

import { Pause, Play, Music } from 'lucide-react';
import type { AudioPlayerHook } from '@/hooks/useAudioPlayer';

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTrack: AudioPlayerHook['currentTrack'];
  onTogglePlay: () => void;
}

export function AudioPlayer({
  isPlaying,
  currentTrack,
  onTogglePlay,
}: AudioPlayerProps) {
  if (!currentTrack) return null;

  const isUnavailable = currentTrack.title === 'Áudio indisponível';

  return (
    <div
      className="fixed z-30 flex items-center gap-3 rounded-full px-4 py-2 border border-white/10 bottom-24 left-1/2 -translate-x-1/2 md:bottom-auto md:top-6 md:right-6 md:left-auto md:translate-x-0"
      style={{
        background: 'rgba(45, 27, 14, 0.85)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <button
        onClick={onTogglePlay}
        disabled={isUnavailable}
        className="p-2 text-[var(--color-brand-gold)] hover:text-[var(--color-brand-rose)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <Music size={14} className="text-[var(--color-brand-rose)] shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-[var(--color-brand-gold)] truncate max-w-[180px]">
            {currentTrack.title}
          </p>
          {currentTrack.artist && (
            <p className="text-[10px] text-gray-400 truncate max-w-[180px]">
              {currentTrack.artist}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
