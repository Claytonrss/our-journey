import NextAuth, { customFetch, type DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Spotify from 'next-auth/providers/spotify';

const configuredAuthUrl =
  process.env.AUTH_URL ??
  process.env.NEXTAUTH_URL ??
  (process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:3000'
    : undefined);

const canonicalAuthUrl = (() => {
  if (!configuredAuthUrl) {
    return undefined;
  }

  const url = new URL(configuredAuthUrl);

  if (process.env.NODE_ENV === 'development' && url.hostname === 'localhost') {
    url.hostname = '127.0.0.1';
  }

  return url.toString().replace(/\/$/, '');
})();

if (canonicalAuthUrl) {
  process.env.AUTH_URL = canonicalAuthUrl;
  process.env.NEXTAUTH_URL ??= canonicalAuthUrl;
}

const spotifyCallbackUrl = canonicalAuthUrl
  ? `${canonicalAuthUrl}/api/auth/callback/spotify`
  : undefined;

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: 'RefreshAccessTokenError';
    user: {
      id?: string;
    } & DefaultSession['user'];
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();

    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + data.expires_in),
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const nextAuth = NextAuth({
  trustHost: true,
  providers: [
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        url: 'https://accounts.spotify.com/authorize',
        params: {
          scope:
            'user-read-email streaming user-read-private user-modify-playback-state user-read-playback-state',
          ...(spotifyCallbackUrl ? { redirect_uri: spotifyCallbackUrl } : {}),
        },
      },
      async [customFetch](input, init) {
        const url = new URL(input instanceof Request ? input.url : input);

        if (url.href === 'https://accounts.spotify.com/api/token') {
          const body = init?.body;

          if (body instanceof URLSearchParams && spotifyCallbackUrl) {
            body.set('redirect_uri', spotifyCallbackUrl);
          }
        }

        return fetch(input, init);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      return await refreshAccessToken(token);
    },
    async redirect({ url, baseUrl }) {
      const redirectUrl = new URL(url, baseUrl);

      if (
        process.env.NODE_ENV === 'development' &&
        redirectUrl.hostname === 'localhost'
      ) {
        redirectUrl.hostname = '127.0.0.1';
      }

      const canonicalOrigin = canonicalAuthUrl
        ? new URL(canonicalAuthUrl).origin
        : baseUrl;

      if (redirectUrl.origin === canonicalOrigin) {
        return redirectUrl.toString();
      }

      return canonicalAuthUrl ?? baseUrl;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (token.error === 'RefreshAccessTokenError') {
        session.error = 'RefreshAccessTokenError';
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut, auth } = nextAuth;
