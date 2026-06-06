import { z } from 'zod';

export const ImageSchema = z.object({
  publicId: z.string(),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const MemorySchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  isSpecialPin: z.boolean(),
  description: z.string(),
  images: z.array(ImageSchema),
});

export type Image = z.infer<typeof ImageSchema>;
export type Memory = z.infer<typeof MemorySchema>;

export interface CurrentTrack {
  title: string;
  artist: string;
  albumCover?: string;
}

export interface AppState {
  activeMemoryId: string | null;
  selectedMemoryId: string | null;
  viewMode: 'story' | 'free';
  isPlaying: boolean;
  currentTrack: CurrentTrack | null;
  isPinValidated: boolean;
  useLocalAudio: boolean;

  // Ações
  setActiveMemoryId: (id: string | null) => void;
  setSelectedMemoryId: (id: string | null) => void;
  setViewMode: (mode: 'story' | 'free') => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: CurrentTrack | null) => void;
  setPinValidated: (status: boolean) => void;
  setUseLocalAudio: (status: boolean) => void;
}
