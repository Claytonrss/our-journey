export interface Image {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface AudioConfig {
  spotifyUri: string;
  localFallbackPath: string;
}

export interface Memory {
  id: string;
  title: string;
  date: string; // Formato YYYY-MM-DD
  coordinates: {
    lat: number;
    lng: number;
  };
  isSpecialPin: boolean;
  description: string;
  images: Image[];
  audioConfig: AudioConfig;
}

export interface CurrentTrack {
  title: string;
  artist: string;
}

export interface AppState {
  activeMemoryId: string | null;
  viewMode: 'story' | 'free';
  isPlaying: boolean;
  currentTrack: CurrentTrack | null;
  isPinValidated: boolean;
  useLocalAudio: boolean;

  // Ações
  setActiveMemoryId: (id: string | null) => void;
  setViewMode: (mode: 'story' | 'free') => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: CurrentTrack | null) => void;
  setPinValidated: (status: boolean) => void;
  setUseLocalAudio: (status: boolean) => void;
}
