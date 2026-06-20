import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/hooks/useAppStore';
import { act } from 'react';

describe('useAppStore', () => {
  beforeEach(() => {
    act(() => {
      useAppStore.setState({
        activeMemoryId: null,
        selectedMemoryId: null,
        isPlaying: false,
        currentTrack: null,
        isPinValidated: false,
        isHeadphonesComplete: false,
        useLocalAudio: false,
      });
    });
  });

  it('has correct initial state', () => {
    const state = useAppStore.getState();
    expect(state.activeMemoryId).toBeNull();
    expect(state.selectedMemoryId).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.currentTrack).toBeNull();
    expect(state.isPinValidated).toBe(false);
    expect(state.isHeadphonesComplete).toBe(false);
    expect(state.useLocalAudio).toBe(false);
  });

  it('setActiveMemoryId updates state', () => {
    act(() => {
      useAppStore.getState().setActiveMemoryId('sp-sao-paulo');
    });
    expect(useAppStore.getState().activeMemoryId).toBe('sp-sao-paulo');
  });

  it('setSelectedMemoryId updates state', () => {
    act(() => {
      useAppStore.getState().setSelectedMemoryId('sp-curitiba');
    });
    expect(useAppStore.getState().selectedMemoryId).toBe('sp-curitiba');
  });

  it('setIsPlaying toggles playback state', () => {
    act(() => {
      useAppStore.getState().setIsPlaying(true);
    });
    expect(useAppStore.getState().isPlaying).toBe(true);

    act(() => {
      useAppStore.getState().setIsPlaying(false);
    });
    expect(useAppStore.getState().isPlaying).toBe(false);
  });

  it('setCurrentTrack sets track info', () => {
    const track = {
      title: 'Test Song',
      artist: 'Artist',
      albumCover: 'https://example.com/cover.jpg',
    };
    act(() => {
      useAppStore.getState().setCurrentTrack(track);
    });
    const current = useAppStore.getState().currentTrack;
    expect(current).toEqual(track);
  });

  it('setCurrentTrack can be set to null', () => {
    act(() => {
      useAppStore.getState().setCurrentTrack({
        title: 'Song',
        artist: 'Artist',
      });
    });
    act(() => {
      useAppStore.getState().setCurrentTrack(null);
    });
    expect(useAppStore.getState().currentTrack).toBeNull();
  });

  it('setPinValidated sets pin status', () => {
    act(() => {
      useAppStore.getState().setPinValidated(true);
    });
    expect(useAppStore.getState().isPinValidated).toBe(true);
  });

  it('setHeadphonesComplete sets headphones status', () => {
    act(() => {
      useAppStore.getState().setHeadphonesComplete(true);
    });
    expect(useAppStore.getState().isHeadphonesComplete).toBe(true);
  });

  it('setUseLocalAudio sets audio mode', () => {
    act(() => {
      useAppStore.getState().setUseLocalAudio(true);
    });
    expect(useAppStore.getState().useLocalAudio).toBe(true);
  });

  it('setActiveMemoryId can be set to null', () => {
    act(() => {
      useAppStore.getState().setActiveMemoryId('sp-sao-paulo');
    });
    act(() => {
      useAppStore.getState().setActiveMemoryId(null);
    });
    expect(useAppStore.getState().activeMemoryId).toBeNull();
  });
});
