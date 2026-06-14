import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HTML5AudioService } from '@/services/html5AudioService';

describe('HTML5AudioService', () => {
  let service: HTML5AudioService;

  beforeEach(() => {
    service = new HTML5AudioService();
    vi.mocked(window.HTMLMediaElement.prototype.play).mockClear();
    vi.mocked(window.HTMLMediaElement.prototype.pause).mockClear();
  });

  it('play() creates a new Audio element and calls play', () => {
    service.play('/audio/test.mp3');
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('pause() calls pause on audio element', () => {
    service.play('/audio/test.mp3');
    service.pause();
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('stop() pauses and nullifies audio', () => {
    service.play('/audio/test.mp3');
    service.stop();
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('resume() calls play on existing audio', () => {
    service.play('/audio/test.mp3');
    vi.mocked(window.HTMLMediaElement.prototype.play).mockClear();
    service.resume();
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('resume() does nothing if no audio element', () => {
    service.resume();
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it('pause() does nothing if no audio element', () => {
    service.pause();
    expect(window.HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
  });
});
