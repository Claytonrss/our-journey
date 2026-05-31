'use client';

import { useCallback, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useAppStore } from '@/hooks/useAppStore';
import {
  SpotifyService,
  SpotifyPlaybackState,
} from '@/services/spotifyService';
import { HTML5AudioService } from '@/services/html5AudioService';

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
    setUseLocalAudio,
  } = useAppStore();

  const spotifyRef = useRef<SpotifyService | null>(null);
  const html5Ref = useRef<HTML5AudioService | null>(null);

  const togglePlay = useCallback(() => {
    if (useLocalAudio) {
      const html5 = html5Ref.current;
      if (!html5) return;

      if (isPlaying) {
        html5.pause();
        setIsPlaying(false);
      } else {
        html5.resume();
        setIsPlaying(true);
      }
      return;
    }

    spotifyRef.current?.togglePlay();
  }, [useLocalAudio, isPlaying, setIsPlaying]);

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signOut();
      return;
    }

    if (useLocalAudio) {
      const html5 = new HTML5AudioService();
      html5Ref.current = html5;
      html5.play('/audio/background.mp3');
      setIsPlaying(true);
      setCurrentTrack({ title: 'Reproduzindo', artist: '' });

      return () => {
        html5.stop();
      };
    }

    if (!session?.accessToken) return;

    const spotify = new SpotifyService();
    spotifyRef.current = spotify;

    spotify.on('player_state_changed', (state) => {
      const s = state as SpotifyPlaybackState | null;
      if (s) {
        setIsPlaying(!s.paused);
        const currentTrack = s.track_window.current_track;
        const albumCover = currentTrack.album?.images?.[0]?.url;
        setCurrentTrack({
          title: currentTrack.name,
          artist: currentTrack.artists[0]?.name || '',
          albumCover,
        });
      }
    });

    spotify.on('authentication_error', () => {
      spotify.disconnect();
      setUseLocalAudio(true);
    });

    const getToken = async (): Promise<string> => {
      const res = await fetch('/api/spotify-token');
      if (!res.ok) return '';
      const data = await res.json();
      return data.accessToken || '';
    };

    spotify
      .init(getToken)
      .then(() => {
        const playlistUri = process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI;
        if (playlistUri) {
          spotify.play(playlistUri);
        }
      })
      .catch(() => {
        setUseLocalAudio(true);
      });

    return () => {
      spotify.disconnect();
    };
  }, [session, useLocalAudio, setIsPlaying, setCurrentTrack, setUseLocalAudio]);

  return { isPlaying, currentTrack, togglePlay };
}
