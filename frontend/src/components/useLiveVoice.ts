import { useState, useRef, useCallback, useEffect } from "react";
import { useMicVAD } from "@ricky0123/vad-react";

export interface LiveVoiceTurn { role: "user" | "assistant"; text: string; }
export interface LiveVoiceState {
  isConnected: boolean; isListening: boolean; isProcessing: boolean;
  currentTranscript: string; currentResponse: string; turns: LiveVoiceTurn[];
  error: string | null; vadLoading: boolean; userSpeaking: boolean;
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE"); writeStr(12, "fmt "); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function useLiveVoice(wsUrl: string) {
  const [state, setState] = useState<LiveVoiceState>({
    isConnected: false, isListening: false, isProcessing: false,
    currentTranscript: "", currentResponse: "", turns: [], error: null,
    vadLoading: true, userSpeaking: false,
  });
  const ws = useRef<WebSocket | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const audioQueue = useRef<AudioBuffer[]>([]);
  const isPlaying = useRef(false);

  const playNext = useCallback(() => {
    if (audioQueue.current.length === 0 || !audioCtx.current) { isPlaying.current = false; return; }
    isPlaying.current = true;
    const source = audioCtx.current.createBufferSource();
    source.buffer = audioQueue.current.shift()!;
    source.connect(audioCtx.current.destination);
    source.onended = playNext;
    source.start();
  }, []);

  const playAudioChunk = async (base64: string) => {
    try {
      if (!base64) return;
      if (!audioCtx.current || audioCtx.current.state === "closed") {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx.current = new AudioCtx();
      }
      if (audioCtx.current.state === "suspended") await audioCtx.current.resume();
      const binStr = atob(base64);
      if (binStr.length < 44) return;
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      const audioBuf = await audioCtx.current.decodeAudioData(bytes.buffer.slice(0));
      audioQueue.current.push(audioBuf);
      if (!isPlaying.current) playNext();
    } catch { /* graceful decode fallback */ }
  };

  const connect = useCallback(() => {
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) return;
    try {
      const socket = new WebSocket(wsUrl);
      socket.binaryType = "arraybuffer";
      socket.onopen = () => setState(s => ({ ...s, isConnected: true, error: null }));
      socket.onclose = () => setState(s => ({ ...s, isConnected: false, isListening: false }));
      socket.onerror = () => setState(s => ({ ...s, error: "WebSocket connection failed" }));
      socket.onmessage = async (e) => {
        const msg = JSON.parse(e.data);
        if (msg.event === "stt_final") setState(s => ({ ...s, currentTranscript: msg.text, isProcessing: !!msg.text }));
        else if (msg.event === "llm_chunk") setState(s => ({ ...s, currentResponse: s.currentResponse + msg.text }));
        else if (msg.event === "tts_audio") await playAudioChunk(msg.data);
        else if (msg.event === "response_complete") {
          setState(s => ({
            ...s, isProcessing: false,
            turns: s.currentTranscript || s.currentResponse
              ? [...s.turns, { role: "user", text: s.currentTranscript }, { role: "assistant", text: s.currentResponse }]
              : s.turns,
            currentTranscript: "", currentResponse: "",
          }));
        }
      };
      ws.current = socket;
    } catch (e: any) { setState(s => ({ ...s, error: e.message })); }
  }, [wsUrl, playNext]);

  const disconnect = useCallback(() => {
    if (ws.current) { ws.current.close(); ws.current = null; }
    audioQueue.current = [];
    isPlaying.current = false;
    if (audioCtx.current) { audioCtx.current.close(); audioCtx.current = null; }
    setState(s => ({ ...s, isConnected: false, isListening: false }));
  }, []);

  const vad = useMicVAD({
    startOnLoad: false,
    baseAssetPath: "/vad/",
    onnxWASMBasePath: "/vad/",
    minSpeechMs: 150,
    positiveSpeechThreshold: 0.3,
    negativeSpeechThreshold: 0.25,
    redemptionMs: 800,
    submitUserSpeechOnPause: true,
    onSpeechEnd: (audio: Float32Array) => {
      if (ws.current?.readyState === WebSocket.OPEN && audio.length >= 1600) {
        ws.current.send(encodeWav(audio, 16000));
      }
    },
  });

  const toggleListening = useCallback(async () => {
    if (!audioCtx.current || audioCtx.current.state === "closed") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx.current = new AudioCtx();
    }
    if (audioCtx.current.state === "suspended") await audioCtx.current.resume();
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) connect();
    if (state.isListening) { await vad.pause(); setState(s => ({ ...s, isListening: false })); }
    else { await vad.start(); setState(s => ({ ...s, isListening: true })); }
  }, [state.isListening, vad, connect]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const error = state.error || (vad.errored ? String(vad.errored) : null);
  return { ...state, vadLoading: vad.loading, userSpeaking: vad.userSpeaking, error, connect, disconnect, toggleListening };
}
