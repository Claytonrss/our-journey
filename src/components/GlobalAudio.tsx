'use client';

import { useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useAppStore } from '@/hooks/useAppStore';
import { SpotifyPlaybackState } from '@/services/spotifyService';
import { publicEnv } from '@/lib/publicEnv';
import { spotifyInstance, html5Instance } from '@/hooks/useAudioPlayer';

export function GlobalAudio() {
  const { data: session } = useSession();
  const {
    useLocalAudio,
    setIsPlaying,
    setCurrentTrack,
    setUseLocalAudio,
    isPinValidated,
    isHeadphonesComplete,
  } = useAppStore();

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isPinValidated || !isHeadphonesComplete) return;

    if (session?.error === 'RefreshAccessTokenError' && !useLocalAudio) {
      signOut();
      return;
    }

    if (useLocalAudio) {
      if (!initializedRef.current) {
        html5Instance.play('/audio/background.mp3');
        setIsPlaying(true);
        setCurrentTrack({ title: 'Reproduzindo', artist: '' });
        initializedRef.current = true;
      }

      return () => {
        html5Instance.stop();
        initializedRef.current = false;
      };
    }

    if (!session?.accessToken) return;

    if (!initializedRef.current) {
      initializedRef.current = true;

      spotifyInstance.on('player_state_changed', (state) => {
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

      spotifyInstance.on('authentication_error', () => {
        spotifyInstance.disconnect();
        setUseLocalAudio(true);
      });

      const getToken = async (): Promise<string> => {
        const res = await fetch('/api/spotify-token');
        if (!res.ok) return '';
        const data = await res.json();
        return data.accessToken || '';
      };

      if (!spotifyInstance.isConnected) {
        spotifyInstance
          .init(getToken)
          .then(() => {
            const playlistUri = publicEnv.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI;
            if (playlistUri) {
              spotifyInstance.play(playlistUri);
            }
          })
          .catch(() => {
            setUseLocalAudio(true);
          });
      }
    }
  }, [
    session,
    useLocalAudio,
    setIsPlaying,
    setCurrentTrack,
    setUseLocalAudio,
    isPinValidated,
    isHeadphonesComplete,
  ]);

  return null;
}
