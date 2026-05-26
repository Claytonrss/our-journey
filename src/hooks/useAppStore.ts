import { create } from 'zustand';
import { AppState, CurrentTrack } from '@/types';

export const useAppStore = create<AppState>((set) => ({
  activeMemoryId: null,
  viewMode: 'story',
  isPlaying: false,
  currentTrack: null,

  setActiveMemoryId: (id: string | null) => set({ activeMemoryId: id }),
  setViewMode: (mode: 'story' | 'free') => set({ viewMode: mode }),
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setCurrentTrack: (track: CurrentTrack | null) => set({ currentTrack: track }),
}));
