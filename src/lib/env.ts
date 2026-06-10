import { z } from 'zod';

const requiredString = z.string().trim().min(1, 'Required');
const optionalUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .optional()
  .or(z.literal('').transform(() => undefined));

const nodeEnvSchema = z
  .enum(['development', 'test', 'production'])
  .default('development');

const pinEnvSchema = z.object({
  SECRET_PIN: z.string().regex(/^\d{4}$/, 'Must be exactly 4 numeric digits'),
});

const authEnvSchema = z
  .object({
    NODE_ENV: nodeEnvSchema,
    AUTH_SECRET: requiredString,
    AUTH_URL: optionalUrl,
    NEXTAUTH_URL: optionalUrl,
    SPOTIFY_CLIENT_ID: requiredString,
    SPOTIFY_CLIENT_SECRET: requiredString,
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.AUTH_URL && !env.NEXTAUTH_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['AUTH_URL'],
        message: 'AUTH_URL or NEXTAUTH_URL is required in production',
      });
    }
  });

const mapboxEnvSchema = z.object({
  MAPBOX_TOKEN: requiredString,
});

const cloudinaryEnvSchema = z.object({
  CLOUDINARY_CLOUD_NAME: requiredString,
  CLOUDINARY_API_KEY: requiredString,
  CLOUDINARY_API_SECRET: requiredString,
});

type PinEnv = z.infer<typeof pinEnvSchema>;
type AuthEnv = z.infer<typeof authEnvSchema>;
type MapboxEnv = z.infer<typeof mapboxEnvSchema>;
type CloudinaryEnv = z.infer<typeof cloudinaryEnvSchema>;

let cachedPinEnv: PinEnv | null = null;
let cachedAuthEnv: AuthEnv | null = null;
let cachedMapboxEnv: MapboxEnv | null = null;
let cachedCloudinaryEnv: CloudinaryEnv | null = null;

function formatEnvError(label: string, error: z.ZodError): Error {
  const details = error.issues
    .map((issue) => {
      const path = issue.path.join('.') || 'env';
      return `- ${path}: ${issue.message}`;
    })
    .join('\n');

  return new Error(`Invalid ${label} environment configuration:\n${details}`);
}

function parseEnv<T extends z.ZodType>(
  label: string,
  schema: T,
  value: unknown,
): z.infer<T> {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw formatEnvError(label, result.error);
  }

  return result.data;
}

export function getPinEnv(): PinEnv {
  cachedPinEnv ??= parseEnv('PIN', pinEnvSchema, {
    SECRET_PIN: process.env.SECRET_PIN,
  });

  return cachedPinEnv;
}

export function getAuthEnv(): AuthEnv {
  cachedAuthEnv ??= parseEnv('auth', authEnvSchema, {
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  });

  return cachedAuthEnv;
}

export function getMapboxEnv(): MapboxEnv {
  cachedMapboxEnv ??= parseEnv('Mapbox', mapboxEnvSchema, {
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  });

  return cachedMapboxEnv;
}

export function getCloudinaryEnv(): CloudinaryEnv {
  cachedCloudinaryEnv ??= parseEnv('Cloudinary', cloudinaryEnvSchema, {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  });

  return cachedCloudinaryEnv;
}

export function getCanonicalAuthUrl(env = getAuthEnv()): string {
  const configuredAuthUrl =
    env.AUTH_URL ??
    env.NEXTAUTH_URL ??
    (env.NODE_ENV === 'development' ? 'http://127.0.0.1:3000' : undefined);

  if (!configuredAuthUrl) {
    throw new Error('AUTH_URL or NEXTAUTH_URL is required outside development');
  }

  const url = new URL(configuredAuthUrl);

  if (env.NODE_ENV === 'development' && url.hostname === 'localhost') {
    url.hostname = '127.0.0.1';
  }

  return url.toString().replace(/\/$/, '');
}
