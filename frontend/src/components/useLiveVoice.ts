import { useState, useRef, useCallback, useEffect } from "react";
import { useMicVAD } from "@ricky0123/vad-react";
import { encodeWav } from "@/lib/audio.utils";
import { useAudioPlayback } from "@/components/useAudioPlayback";

export interface LiveVoiceTurn { role: "user" | "assistant"; text: string; }
export interface LiveVoiceState {
  isConnected: boolean; isListening: boolean; isProcessing: boolean;
  currentTranscript: string; currentResponse: string; turns: LiveVoiceTurn[];
  error: string | null; vadLoading: boolean; userSpeaking: boolean;
}

export function useLiveVoice(wsUrl: string, language: string = "auto") {
  const [state, setState] = useState<LiveVoiceState>({
    isConnected: false, isListening: false, isProcessing: false,
    currentTranscript: "", currentResponse: "", turns: [], error: null, vadLoading: true, userSpeaking: false,
  });
  const ws = useRef<WebSocket | null>(null);
  const { ensureAudioContext, playAudioChunk, stopAudio } = useAudioPlayback();

  const connect = useCallback(() => {
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) return;
    try {
      const socket = new WebSocket(wsUrl);
      socket.binaryType = "arraybuffer";
      socket.onopen = () => {
        setState(s => ({ ...s, isConnected: true, error: null }));
        socket.send(JSON.stringify({ action: "set_language", language }));
      };
      socket.onclose = (ev: CloseEvent) => setState(s => ({
        ...s, isConnected: false, isListening: false,
        error: ev.reason || (ev.code !== 1000 && ev.code !== 1005 ? `WebSocket closed (code ${ev.code})` : s.error),
      }));
      socket.onerror = () => setState(s => ({ ...s, error: "WebSocket connection failed" }));
      socket.onmessage = async (e) => {
        try {
          const msg = typeof e.data === "string" ? JSON.parse(e.data) : null;
          if (!msg) return;
          if (msg.event === "session_status") setState(s => ({ ...s, isConnected: true }));
          else if (msg.event === "stt_partial") setState(s => ({ ...s, currentTranscript: msg.text, isProcessing: true }));
          else if (msg.event === "stt_final") setState(s => ({ ...s, currentTranscript: msg.text, isProcessing: !!msg.text }));
          else if (msg.event === "llm_chunk") setState(s => ({ ...s, currentResponse: s.currentResponse + msg.text }));
          else if (msg.event === "tts_audio") await playAudioChunk(msg.data);
          else if (msg.event === "error") {
            setState(s => ({ ...s, isProcessing: false, isListening: false, error: msg.message || "Voice error", currentTranscript: "", currentResponse: "" }));
          } else if (msg.event === "response_complete") {
            setState(s => ({
              ...s, isProcessing: false,
              turns: s.currentTranscript || s.currentResponse
                ? [...s.turns, { role: "user", text: s.currentTranscript }, { role: "assistant", text: s.currentResponse }]
                : s.turns,
              currentTranscript: "", currentResponse: "",
            }));
          }
        } catch { /* ignore malformed frames */ }
      };
      ws.current = socket;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "WebSocket error";
      setState(s => ({ ...s, error: msg }));
    }
  }, [wsUrl, playAudioChunk]);

  const disconnect = useCallback(() => {
    if (ws.current) { ws.current.close(); ws.current = null; }
    stopAudio();
    setState(s => ({ ...s, isConnected: false, isListening: false }));
  }, [stopAudio]);

  const vad = useMicVAD({
    startOnLoad: false,
    baseAssetPath: "/vad/",
    onnxWASMBasePath: "/vad/",
    minSpeechMs: 150, positiveSpeechThreshold: 0.3, negativeSpeechThreshold: 0.25,
    redemptionMs: 800, submitUserSpeechOnPause: true,
    onSpeechEnd: (audio: Float32Array) => {
      if (ws.current?.readyState === WebSocket.OPEN && audio.length >= 1600) {
        ws.current.send(encodeWav(audio, 16000));
      }
    },
  });

  const toggleListening = useCallback(async () => {
    await ensureAudioContext();
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) connect();
    if (state.isListening) { await vad.pause(); setState(s => ({ ...s, isListening: false })); }
    else { await vad.start(); setState(s => ({ ...s, isListening: true })); }
  }, [state.isListening, vad, connect, ensureAudioContext]);

  useEffect(() => { connect(); return () => disconnect(); }, [connect, disconnect]);
  useEffect(() => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ action: "set_language", language }));
  }, [language]);

  const error = state.error || (vad.errored ? String(vad.errored) : null);
  return { ...state, vadLoading: vad.loading, userSpeaking: vad.userSpeaking, error, connect, disconnect, toggleListening };
}
