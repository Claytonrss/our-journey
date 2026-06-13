import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpotifyService } from '@/services/spotifyService';

interface TestableSpotifyService extends SpotifyService {
  player: {
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    togglePlay: ReturnType<typeof vi.fn>;
    _options: { name: string; getOAuthToken: ReturnType<typeof vi.fn> };
  } | null;
  deviceId: string | null;
  emit: (event: string, payload?: unknown) => void;
}

describe('SpotifyService', () => {
  let service: TestableSpotifyService;

  beforeEach(() => {
    service = new SpotifyService() as TestableSpotifyService;
  });

  it('isConnected returns false initially', () => {
    expect(service.isConnected).toBe(false);
  });

  it('togglePlay() is no-op when not connected', async () => {
    await expect(service.togglePlay()).resolves.not.toThrow();
  });

  it('play() is no-op when not connected', async () => {
    await expect(service.play('spotify:playlist:test')).resolves.not.toThrow();
  });

  it('disconnect() does not throw when not connected', () => {
    expect(() => service.disconnect()).not.toThrow();
  });

  it('togglePlay() calls player togglePlay when connected', async () => {
    const togglePlay = vi.fn().mockResolvedValue(undefined);
    const mockPlayer = {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      connect: vi.fn().mockResolvedValue(true),
      disconnect: vi.fn(),
      togglePlay,
      _options: { name: 'test', getOAuthToken: vi.fn() },
    };

    service.player = mockPlayer;
    service.deviceId = 'test-device-id';

    await service.togglePlay();
    expect(togglePlay).toHaveBeenCalled();
  });

  it('disconnect() removes listeners and clears state when connected', () => {
    const mockPlayer = {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      togglePlay: vi.fn(),
      _options: { name: 'test', getOAuthToken: vi.fn() },
    };

    service.player = mockPlayer;
    service.deviceId = 'test-device-id';

    service.disconnect();
    expect(mockPlayer.disconnect).toHaveBeenCalled();
    expect(service.isConnected).toBe(false);
  });

  it('on() registers callbacks that can be triggered via emit', () => {
    const cb = vi.fn();
    service.on('test-event', cb);

    service.emit('test-event', { data: 42 });
    expect(cb).toHaveBeenCalledWith({ data: 42 });
  });

  it('on() multiple callbacks for same event', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    service.on('event', cb1);
    service.on('event', cb2);

    service.emit('event', 'payload');
    expect(cb1).toHaveBeenCalledWith('payload');
    expect(cb2).toHaveBeenCalledWith('payload');
  });

  it('emit() with no registered callbacks does not throw', () => {
    expect(() => service.emit('no-listeners')).not.toThrow();
  });
});
