/**
 * Gapless Web Audio API queue for real-time TTS playback.
 */
import { base64ToUint8Array } from '@/lib/audio.utils';

export class AudioPlaybackQueue {
  private ctx: AudioContext | null = null;
  private queue: AudioBuffer[] = [];
  private activeSource: AudioBufferSourceNode | null = null;
  private playing: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const CtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!CtxClass) return null;
    if (!this.ctx) {
      this.ctx = new CtxClass();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  async enqueueBase64(base64: string): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const bytes = base64ToUint8Array(base64);
      const buffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
      this.queue.push(buffer);
      if (!this.playing) {
        this.playNext();
      }
    } catch {
      // Graceful fallback on audio decode failure
    }
  }

  private playNext(): void {
    if (this.queue.length === 0) {
      this.playing = false;
      this.activeSource = null;
      return;
    }
    const ctx = this.getContext();
    if (!ctx) return;

    this.playing = true;
    const buffer = this.queue.shift()!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = (): void => {
      this.playNext();
    };
    this.activeSource = source;
    source.start();
  }

  stopAndClear(): void {
    this.queue = [];
    if (this.activeSource) {
      try {
        this.activeSource.stop();
        this.activeSource.disconnect();
      } catch {
        // Source already terminated
      }
      this.activeSource = null;
    }
    this.playing = false;
  }

  get isPlaying(): boolean {
    return this.playing;
  }
}
