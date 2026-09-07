import { useRef, useCallback } from "react";

export function useAudioPlayback() {
  const audioCtx = useRef<AudioContext | null>(null);
  const audioQueue = useRef<AudioBuffer[]>([]);
  const isPlaying = useRef(false);

  const playNext = useCallback(() => {
    if (audioQueue.current.length === 0 || !audioCtx.current) {
      isPlaying.current = false;
      return;
    }
    isPlaying.current = true;
    const source = audioCtx.current.createBufferSource();
    source.buffer = audioQueue.current.shift()!;
    source.connect(audioCtx.current.destination);
    source.onended = playNext;
    source.start();
  }, []);

  const ensureAudioContext = async (): Promise<AudioContext> => {
    if (!audioCtx.current || audioCtx.current.state === "closed") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx.current = new AudioCtx();
    }
    if (audioCtx.current.state === "suspended") await audioCtx.current.resume();
    return audioCtx.current;
  };

  const playAudioChunk = async (base64: string) => {
    try {
      if (!base64) return;
      const ctx = await ensureAudioContext();
      const binStr = atob(base64);
      if (binStr.length < 44) return;
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      const audioBuf = await ctx.decodeAudioData(bytes.buffer.slice(0));
      audioQueue.current.push(audioBuf);
      if (!isPlaying.current) playNext();
    } catch (err: unknown) {
      // Graceful decode fallback
    }
  };

  const stopAudio = useCallback(() => {
    audioQueue.current = [];
    isPlaying.current = false;
    if (audioCtx.current) {
      audioCtx.current.close();
      audioCtx.current = null;
    }
  }, []);

  return { ensureAudioContext, playAudioChunk, stopAudio, playNext };
}
