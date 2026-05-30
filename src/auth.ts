import NextAuth, { customFetch, type DefaultSession } from 'next-auth';
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
    user: {
      id?: string;
    } & DefaultSession['user'];
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
      }
      return token;
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
      // Passar o token para a sessão
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});

export const { handlers, signIn, signOut, auth } = nextAuth;
