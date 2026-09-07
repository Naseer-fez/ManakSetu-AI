import React, { useEffect, useRef, useState } from "react";
import { Mic, Bot, Volume2, Pause, Sparkles } from "lucide-react";
import type { VoiceChatMessage } from "../types";

interface VoiceChatThreadProps {
  messages: VoiceChatMessage[];
  isProcessing: boolean;
}

export const VoiceChatThread: React.FC<VoiceChatThreadProps> = ({ messages, isProcessing }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const toggleAudio = (id: string, url?: string) => {
    if (!url) return;
    if (playingId === id && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => setPlayingId(null));
    setPlayingId(id);
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
  };

  if (messages.length === 0 && !isProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-3 min-h-[340px]">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">Voice Assistant Ready</h3>
        <p className="max-w-md text-sm text-slate-400">
          Speak your procurement or standard questions in English or Hindi. Automatic speech recognition will transcribe and answer with speech.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[520px] min-h-[340px]">
      {messages.map((m) => (
        <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          {m.role === "assistant" && (
            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
          )}
          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md ${
            m.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "apple-glass text-slate-200 border border-white/10 rounded-bl-none"
          }`}>
            <div className="flex items-center justify-between gap-2 mb-1 text-xs opacity-75">
              <span className="font-semibold">{m.role === "user" ? "You (Spoken)" : "BIS AI Copilot"}</span>
              {m.detectedLanguage && (
                <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono">
                  {m.detectedLanguage}
                </span>
              )}
            </div>
            <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
            {m.audioUrl && (
              <button
                type="button"
                onClick={() => toggleAudio(m.id, m.audioUrl)}
                className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all border border-purple-500/30"
              >
                {playingId === m.id ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {playingId === m.id ? "Pause Audio" : "Listen Response"}
              </button>
            )}
          </div>
          {m.role === "user" && (
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 flex-shrink-0 mt-1">
              <Mic className="w-4 h-4" />
            </div>
          )}
        </div>
      ))}
      {isProcessing && (
        <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-3 apple-glass rounded-xl w-fit">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Transcribing voice & synthesizing answer...
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
