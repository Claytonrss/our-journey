import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HTML5AudioService } from '@/services/html5AudioService';

describe('HTML5AudioService', () => {
  let service: HTML5AudioService;

  beforeEach(() => {
    service = new HTML5AudioService();
  });

  it('play() creates a new Audio element and calls play', () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play');
    service.play('/audio/test.mp3');
    expect(playSpy).toHaveBeenCalled();
    playSpy.mockRestore();
  });

  it('pause() calls pause on audio element', () => {
    const pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'pause');
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play');

    service.play('/audio/test.mp3');
    service.pause();
    expect(pauseSpy).toHaveBeenCalled();

    playSpy.mockRestore();
    pauseSpy.mockRestore();
  });

  it('stop() pauses and nullifies audio', () => {
    const pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'pause');
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play');

    service.play('/audio/test.mp3');
    service.stop();
    expect(pauseSpy).toHaveBeenCalled();

    playSpy.mockRestore();
    pauseSpy.mockRestore();
  });

  it('resume() calls play on existing audio', () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play');

    service.play('/audio/test.mp3');
    playSpy.mockClear();
    service.resume();
    expect(playSpy).toHaveBeenCalled();

    playSpy.mockRestore();
  });

  it('resume() does nothing if no audio element', () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play');
    service.resume();
    expect(playSpy).not.toHaveBeenCalled();
    playSpy.mockRestore();
  });

  it('pause() does nothing if no audio element', () => {
    const pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'pause');
    service.pause();
    expect(pauseSpy).not.toHaveBeenCalled();
    pauseSpy.mockRestore();
  });
});
