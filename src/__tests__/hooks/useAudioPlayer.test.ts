import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '@/hooks/useAppStore';

vi.mock('@/services/spotifyService', () => ({
  SpotifyService: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    init: vi.fn(),
    play: vi.fn(),
    togglePlay: vi.fn(),
    disconnect: vi.fn(),
    isConnected: false,
  })),
}));

vi.mock('@/services/html5AudioService', () => ({
  HTML5AudioService: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
  })),
}));

describe('useAudioPlayer', () => {
  beforeEach(() => {
    act(() => {
      useAppStore.setState({
        isPlaying: false,
        currentTrack: null,
        useLocalAudio: false,
        isPinValidated: true,
        isHeadphonesComplete: true,
      });
    });
  });

  it('returns initial state', async () => {
    const { useAudioPlayer } = await import('@/hooks/useAudioPlayer');
    const { result } = renderHook(() => useAudioPlayer());
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTrack).toBeNull();
  });

  it('togglePlay pauses when playing with local audio', async () => {
    act(() => {
      useAppStore.getState().setUseLocalAudio(true);
      useAppStore.getState().setIsPlaying(true);
    });

    const { useAudioPlayer } = await import('@/hooks/useAudioPlayer');
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.togglePlay();
    });

    expect(useAppStore.getState().isPlaying).toBe(false);
  });

  it('togglePlay resumes when paused with local audio', async () => {
    act(() => {
      useAppStore.getState().setUseLocalAudio(true);
      useAppStore.getState().setIsPlaying(false);
    });

    const { useAudioPlayer } = await import('@/hooks/useAudioPlayer');
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.togglePlay();
    });

    expect(useAppStore.getState().isPlaying).toBe(true);
  });

  it('togglePlay delegates to spotify when not using local audio', async () => {
    act(() => {
      useAppStore.getState().setUseLocalAudio(false);
    });

    const { useAudioPlayer } = await import('@/hooks/useAudioPlayer');
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.togglePlay();
    });

    const { spotifyInstance } = await import('@/hooks/useAudioPlayer');
    expect(spotifyInstance.togglePlay).toHaveBeenCalled();
  });
});
