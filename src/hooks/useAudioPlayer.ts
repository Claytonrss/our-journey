'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { SpotifyService } from '@/services/spotifyService';
import { HTML5AudioService } from '@/services/html5AudioService';

export const spotifyInstance = new SpotifyService();
export const html5Instance = new HTML5AudioService();

export interface AudioPlayerHook {
  isPlaying: boolean;
  currentTrack: { title: string; artist: string; albumCover?: string } | null;
  togglePlay: () => void;
}

export function useAudioPlayer(): AudioPlayerHook {
  const { isPlaying, currentTrack, useLocalAudio, setIsPlaying } =
    useAppStore();

  const togglePlay = useCallback(() => {
    if (useLocalAudio) {
      if (isPlaying) {
        html5Instance.pause();
        setIsPlaying(false);
      } else {
        html5Instance.resume();
        setIsPlaying(true);
      }
      return;
    }

    spotifyInstance.togglePlay();
  }, [useLocalAudio, isPlaying, setIsPlaying]);

  return { isPlaying, currentTrack, togglePlay };
}
