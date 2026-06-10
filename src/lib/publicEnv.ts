import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI: z
    .string()
    .trim()
    .regex(/^spotify:playlist:[A-Za-z0-9]+$/, 'Must be a Spotify playlist URI'),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI:
    process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI,
});
