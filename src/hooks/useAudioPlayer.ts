'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
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
  playTrack: (spotifyUri: string, localPath: string) => void;
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

  const stopCurrent = useCallback(() => {
    html5Ref.current?.stop();
    spotifyRef.current?.togglePlay();
  }, []);

  const playTrack = useCallback(
    (spotifyUri: string, localPath: string) => {
      stopCurrent();

      if (useLocalAudio || !session?.accessToken) {
        console.info('Using HTML5 Audio Fallback');
        const html5 = new HTML5AudioService();
        html5Ref.current = html5;

        html5.onEnded(() => {
          setIsPlaying(false);
        });

        html5.onError(() => {
          console.info('Local MP3 failed to load');
          setCurrentTrack({ title: 'Áudio indisponível', artist: '' });
          setIsPlaying(false);
        });

        html5.play(localPath);
        html5.resume();
        setIsPlaying(true);
        setCurrentTrack({ title: 'Reproduzindo', artist: '' });
        return;
      }

      const spotify = spotifyRef.current;
      if (!spotify) return;

      spotify.play(spotifyUri, session.accessToken);
    },
    [session, useLocalAudio, setIsPlaying, setCurrentTrack, stopCurrent],
  );

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

    spotify.on('authentication_error', () => {
      console.info(
        'Spotify SDK authentication failed. Swapping to HTML5 Audio Fallback',
      );
      setUseLocalAudio(true);
    });

    spotify.on('account_error', () => {
      console.info(
        'Spotify Premium required. Swapping to HTML5 Audio Fallback',
      );
      setUseLocalAudio(true);
    });

    spotify.on('initialization_error', () => {
      console.info(
        'Spotify SDK failed to initialize. Swapping to HTML5 Audio Fallback',
      );
      setUseLocalAudio(true);
    });

    spotify.init(session.accessToken);

    return () => {
      spotify.disconnect();
    };
  }, [session, useLocalAudio, setIsPlaying, setCurrentTrack, setUseLocalAudio]);

  return { isPlaying, currentTrack, togglePlay, playTrack };
}
