import { create } from 'zustand';
import { AppState, CurrentTrack } from '@/types';

export const useAppStore = create<AppState>((set) => ({
  activeMemoryId: null,
  selectedMemoryId: null,
  viewMode: 'story',
  isPlaying: false,
  currentTrack: null,
  isPinValidated: false,
  useLocalAudio: false,

  setActiveMemoryId: (id: string | null) => set({ activeMemoryId: id }),
  setSelectedMemoryId: (id: string | null) => set({ selectedMemoryId: id }),
  setViewMode: (mode: 'story' | 'free') => set({ viewMode: mode }),
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setCurrentTrack: (track: CurrentTrack | null) => set({ currentTrack: track }),
  setPinValidated: (status: boolean) => set({ isPinValidated: status }),
  setUseLocalAudio: (status: boolean) => set({ useLocalAudio: status }),
}));
