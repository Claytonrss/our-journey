export class HTML5AudioService {
  private audio: HTMLAudioElement | null = null;

  play(src: string): void {
    this.stop();
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.play().catch(() => {});
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
      this.audio = null;
    }
  }
}
