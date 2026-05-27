export type AudioEventCallback = () => void;

export class HTML5AudioService {
  private audio: HTMLAudioElement | null = null;
  private endedCallbacks: AudioEventCallback[] = [];
  private errorCallbacks: AudioEventCallback[] = [];

  play(src: string): void {
    this.stop();
    this.audio = new Audio(src);

    this.endedCallbacks.forEach((cb) => {
      this.audio?.addEventListener('ended', cb, { once: true });
    });

    this.errorCallbacks.forEach((cb) => {
      this.audio?.addEventListener('error', cb, { once: true });
    });
  }

  resume(): void {
    this.audio?.play().catch(() => {});
  }

  pause(): void {
    this.audio?.pause();
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }

  onEnded(callback: AudioEventCallback): void {
    this.endedCallbacks.push(callback);
  }

  onError(callback: AudioEventCallback): void {
    this.errorCallbacks.push(callback);
  }
}
