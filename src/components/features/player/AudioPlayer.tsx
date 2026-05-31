'use client';

import { Pause, Play, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/hooks/useAppStore';

interface AudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function AudioPlayer({ isPlaying, onTogglePlay }: AudioPlayerProps) {
  const { currentTrack } = useAppStore();

  const title = currentTrack?.title || 'Nossa Trilha';
  const artist = currentTrack?.artist || 'Amor & Viagem';
  const albumCover = currentTrack?.albumCover;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed z-30 flex items-center justify-between bg-[#111111]/85 backdrop-blur-xl border border-[rgba(212,175,55,0.2)] shadow-[0_4px_24px_rgba(212,175,55,0.12)] rounded-full"
      style={{
        bottom: '92px',
        left: '16px',
        width: '230px',
        height: '48px',
      }}
    >
      {/* Album Art / Cover Section */}
      <div className="flex items-center pl-2 flex-1 min-w-0">
        <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-neutral-900 border border-[rgba(212,175,55,0.15)] flex-shrink-0">
          {albumCover ? (
            <motion.img
              src={albumCover}
              alt="Capa do Álbum"
              className="w-full h-full object-cover"
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
            />
          ) : (
            <motion.div
              className="text-[rgba(212,175,55,0.8)]"
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
            >
              <Music size={14} />
            </motion.div>
          )}
        </div>

        {/* Track details */}
        <div className="flex flex-col justify-center pl-2.5 pr-2 overflow-hidden flex-1 select-none">
          <span className="text-[11px] font-medium text-neutral-100 truncate tracking-wide">
            {title}
          </span>
          <span className="text-[9px] text-neutral-400 truncate mt-0.5 uppercase tracking-wider font-semibold">
            {artist}
          </span>
        </div>
      </div>

      {/* Play/Pause Button Section (48px Touch Target) */}
      <button
        onClick={onTogglePlay}
        className="h-12 w-12 flex items-center justify-center flex-shrink-0 transition-all active:scale-90 cursor-pointer text-[rgba(212,175,55,0.95)] hover:text-white"
        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        <div className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.25)] flex items-center justify-center hover:bg-[rgba(212,175,55,0.2)] transition-colors duration-200">
          {isPlaying ? (
            <Pause size={12} fill="currentColor" />
          ) : (
            <Play size={12} fill="currentColor" className="ml-0.5" />
          )}
        </div>
      </button>
    </motion.div>
  );
}
