'use client';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
}

interface SpotifyPlayer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addListener: (event: string, callback: (args: any) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeListener: (event: string, callback?: (args: any) => void) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
  _options: SpotifyPlayerOptions;
}

export interface SpotifyPlaybackState {
  paused: boolean;
  track_window: {
    current_track: {
      name: string;
      artists: { name: string }[];
    };
  };
}

export type SpotifyEventCallback = (payload: unknown) => void;

const SPOTIFY_SDK_URL = 'https://sdk.scdn.co/spotify-player.js';

export class SpotifyService {
  private player: SpotifyPlayer | null = null;
  private deviceId: string | null = null;
  private listeners: Map<string, SpotifyEventCallback[]> = new Map();

  on(event: string, callback: SpotifyEventCallback): void {
    const existing = this.listeners.get(event) || [];
    existing.push(callback);
    this.listeners.set(event, existing);
    this.player?.addListener(event, callback);
  }

  private emit(event: string, payload?: unknown): void {
    (this.listeners.get(event) || []).forEach((cb) => cb(payload));
  }

  async init(accessToken: string): Promise<void> {
    await this.loadScript();

    return new Promise((resolve, reject) => {
      let settled = false;
      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        fn();
      };

      const onReady = () => {
        try {
          this.player = new window.Spotify!.Player({
            name: 'Our Journey',
            getOAuthToken: (cb) => cb(accessToken),
            volume: 0.5,
          });

          this.player.addListener(
            'ready',
            ({ device_id }: { device_id: string }) => {
              this.deviceId = device_id;
              this.emit('ready', { device_id });
              settle(() => resolve());
            },
          );

          this.player.addListener('not_ready', () => {
            this.emit('not_ready');
          });

          this.player.addListener('player_state_changed', (state) => {
            this.emit('player_state_changed', state);
          });

          this.player.addListener(
            'initialization_error',
            ({ message }: { message: string }) => {
              console.info('Spotify SDK initialization error:', message);
              this.emit('initialization_error');
              settle(() => reject(new Error(message)));
            },
          );

          this.player.addListener(
            'authentication_error',
            ({ message }: { message: string }) => {
              console.info('Spotify SDK authentication error:', message);
              this.emit('authentication_error');
              settle(() => reject(new Error(message)));
            },
          );

          this.player.addListener(
            'account_error',
            ({ message }: { message: string }) => {
              console.info(
                'Spotify account error (Premium required):',
                message,
              );
              this.emit('account_error');
              settle(() => reject(new Error(message)));
            },
          );

          this.listeners.forEach((callbacks, event) => {
            callbacks.forEach((cb) => this.player!.addListener(event, cb));
          });

          this.player.connect();
        } catch (err) {
          settle(() => reject(err));
        }
      };

      if (window.Spotify) {
        onReady();
      } else {
        window.onSpotifyWebPlaybackSDKReady = onReady;
      }
    });
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Spotify) {
        resolve();
        return;
      }

      if (document.querySelector(`script[src="${SPOTIFY_SDK_URL}"]`)) {
        window.onSpotifyWebPlaybackSDKReady = () => {
          resolve();
        };
        return;
      }

      const script = document.createElement('script');
      script.src = SPOTIFY_SDK_URL;
      script.async = true;
      script.onerror = () => reject(new Error('Failed to load Spotify SDK'));
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        resolve();
      };
    });
  }

  async play(spotifyUri: string, accessToken: string): Promise<void> {
    if (!this.deviceId) return;

    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ uris: [spotifyUri] }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }

  async togglePlay(): Promise<void> {
    await this.player?.togglePlay();
  }

  async disconnect(): Promise<void> {
    if (this.player) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((cb) => this.player?.removeListener(event, cb));
      });
      this.player.disconnect();
      this.player = null;
      this.deviceId = null;
    }
  }

  get isConnected(): boolean {
    return this.deviceId !== null;
  }
}
