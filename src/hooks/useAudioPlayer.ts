'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/hooks/useAppStore';
import {
  SpotifyService,
  SpotifyPlaybackState,
} from '@/services/spotifyService';

export interface AudioPlayerHook {
  isPlaying: boolean;
  currentTrack: { title: string; artist: string } | null;
  togglePlay: () => void;
}

export function useAudioPlayer(): AudioPlayerHook {
  const { data: session } = useSession();
  const {
    isPlaying,
    currentTrack,
    useLocalAudio,
    setIsPlaying,
    setCurrentTrack,
  } = useAppStore();

  const spotifyRef = useRef<SpotifyService | null>(null);

  const togglePlay = useCallback(() => {
    spotifyRef.current?.togglePlay();
  }, []);

  useEffect(() => {
    if (useLocalAudio || !session?.accessToken) return;

    const spotify = new SpotifyService();
    spotifyRef.current = spotify;

    spotify.on('player_state_changed', (state) => {
      const s = state as SpotifyPlaybackState | null;
      if (s) {
        setIsPlaying(!s.paused);
        setCurrentTrack({
          title: s.track_window.current_track.name,
          artist: s.track_window.current_track.artists[0]?.name || '',
        });
      }
    });

    spotify
      .init(session.accessToken)
      .then(() => {
        const playlistUri = process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI;
        if (playlistUri) {
          spotify.play(playlistUri, session.accessToken!);
        }
      })
      .catch(() => {
        console.info('Spotify SDK initialization failed');
      });

    return () => {
      spotify.disconnect();
    };
  }, [session, useLocalAudio, setIsPlaying, setCurrentTrack]);

  return { isPlaying, currentTrack, togglePlay };
}
