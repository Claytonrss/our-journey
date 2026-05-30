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
      className="fixed z-30 bottom-[72px] left-0 right-0 flex items-center"
      style={{
        background: 'rgba(212,175,55,0.06)',
        borderTop: '1px solid rgba(212,175,55,0.1)',
        padding: '12px 24px',
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'var(--bg-surface)',
        }}
      >
        <Music size={16} style={{ color: 'var(--text-secondary)' }} />
      </div>

      <div className="flex-1 min-w-0 ml-3">
        {isUnavailable ? (
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              opacity: 0.5,
            }}
          >
            ♪ Trilha sonora
          </p>
        ) : (
          <>
            <p
              className="truncate"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}
            >
              {currentTrack.title}
            </p>
            {currentTrack.artist && (
              <p
                className="truncate"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                }}
              >
                {currentTrack.artist}
              </p>
            )}
          </>
        )}
      </div>

      <button
        onClick={onTogglePlay}
        disabled={isUnavailable}
        className="shrink-0 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--gold)',
          color: '#0a0a0a',
        }}
        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>
    </div>
  );
}
