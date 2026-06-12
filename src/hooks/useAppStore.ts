import { create } from 'zustand';
import { AppState, CurrentTrack } from '@/types';

export const useAppStore = create<AppState>((set) => ({
  activeMemoryId: null,
  selectedMemoryId: null,
  viewMode: 'story',
  isPlaying: false,
  currentTrack: null,
  isPinValidated: false,
  isHeadphonesComplete: false,
  useLocalAudio: false,

  setActiveMemoryId: (id: string | null) => set({ activeMemoryId: id }),
  setSelectedMemoryId: (id: string | null) => set({ selectedMemoryId: id }),
  setViewMode: (mode: 'story' | 'free') => set({ viewMode: mode }),
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setCurrentTrack: (track: CurrentTrack | null) => set({ currentTrack: track }),
  setPinValidated: (status: boolean) => set({ isPinValidated: status }),
  setHeadphonesComplete: (status: boolean) =>
    set({ isHeadphonesComplete: status }),
  setUseLocalAudio: (status: boolean) => set({ useLocalAudio: status }),
}));
