/**
 * Real-time WebSocket hook for Live Voice translation and assistant session.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioPlaybackQueue } from '@/lib/audioQueue';
import { encodeWav } from '@/lib/audio.utils';
import type { LiveVoiceTurn, LiveVoiceServerEvent } from '@/types/voice.types';

export function useLiveVoice() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [turns, setTurns] = useState<LiveVoiceTurn[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioQueueRef = useRef<AudioPlaybackQueue>(new AudioPlaybackQueue());

  const disconnect = useCallback((): void => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    audioQueueRef.current.stopAndClear();
    setIsConnected(false);
    setStatus('idle');
  }, []);

  const connect = useCallback((): void => {
    if (wsRef.current) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/voice/live`);

    ws.onopen = (): void => { setIsConnected(true); setError(null); };
    ws.onmessage = (event: MessageEvent): void => {
      try {
        const data = JSON.parse(event.data) as LiveVoiceServerEvent;
        if (data.event === 'stt_partial') setCurrentTranscript(data.text);
        else if (data.event === 'stt_final') {
          setCurrentTranscript(data.text);
          setTurns(prev => [...prev, { role: 'user', text: data.text }]);
          setStatus('processing');
        } else if (data.event === 'llm_chunk') setCurrentResponse(prev => prev + data.text);
        else if (data.event === 'tts_audio') void audioQueueRef.current.enqueueBase64(data.data);
        else if (data.event === 'response_complete') {
          setTurns(prev => [...prev, { role: 'assistant', text: data.full_text }]);
          setCurrentResponse(''); setCurrentTranscript(''); setStatus('idle');
        } else if (data.event === 'error') setError(data.message);
      } catch { /* Non-JSON message ignore */ }
    };
    ws.onerror = (): void => setError('WebSocket connection encountered an error');
    ws.onclose = (): void => { setIsConnected(false); setStatus('idle'); wsRef.current = null; };
    wsRef.current = ws;
  }, []);

  const sendAudioSamples = useCallback((samples: Float32Array): void => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(encodeWav(samples));
  }, []);

  const reset = useCallback((): void => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'reset' }));
    }
    audioQueueRef.current.stopAndClear();
    setTurns([]); setCurrentTranscript(''); setCurrentResponse('');
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  return {
    isConnected, status, turns, currentTranscript, currentResponse,
    error, connect, disconnect, sendAudioSamples, reset, setStatus,
  };
}
