import React, { useEffect, useRef, useState } from "react";
import { Mic, Bot, Volume2, Pause, Sparkles } from "lucide-react";
import type { VoiceChatMessage } from "@/types";

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
    audio.play().catch((_err: unknown) => setPlayingId(null));
    setPlayingId(id);
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
  };

  if (messages.length === 0 && !isProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gov-text-secondary dark:text-gray-400 gap-3 min-h-[340px]">
        <div className="w-16 h-16 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-gov-blue dark:text-blue-400 shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gov-navy dark:text-white">Voice Assistant Ready</h3>
        <p className="max-w-md text-xs text-gov-text-secondary dark:text-gray-400 leading-relaxed">
          Speak your procurement or standard questions in English or Hindi. Automatic speech recognition will transcribe and answer with speech.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[520px] min-h-[340px] bg-gov-offwhite dark:bg-[#0a0f18] rounded-lg">
      {messages.map((m) => (
        <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          {m.role === "assistant" && (
            <div className="w-8 h-8 rounded bg-gov-navy dark:bg-slate-700 text-gov-saffron dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
          )}
          <div className={`max-w-[80%] rounded-lg px-4 py-3 text-xs shadow-sm leading-relaxed ${
            m.role === "user"
              ? "bg-gov-blue text-white rounded-br-none"
              : "bg-white dark:bg-slate-800/90 text-gov-text dark:text-gray-100 border border-gov-border dark:border-slate-700 rounded-bl-none"
          }`}>
            <div className="flex items-center justify-between gap-2 mb-1 text-[11px] opacity-75 font-medium">
              <span className="font-bold">{m.role === "user" ? "You (Spoken)" : "BIS AI Copilot"}</span>
              {m.detectedLanguage && (
                <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-gov-offwhite dark:bg-slate-700 text-gov-text dark:text-gray-200 border border-gov-border dark:border-slate-600 font-mono">
                  {m.detectedLanguage}
                </span>
              )}
            </div>
            <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
            {m.audioUrl && (
              <button
                type="button" onClick={() => toggleAudio(m.id, m.audioUrl)}
                className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-gov-blue dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-200 dark:border-blue-900/50"
              >
                {playingId === m.id ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {playingId === m.id ? "Pause Audio" : "Listen Response"}
              </button>
            )}
          </div>
          {m.role === "user" && (
            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-950 text-gov-blue dark:text-blue-300 flex items-center justify-center flex-shrink-0 mt-1">
              <Mic className="w-4 h-4" />
            </div>
          )}
        </div>
      ))}
      {isProcessing && (
        <div className="flex items-center gap-2 text-gov-text-secondary dark:text-gray-300 text-xs py-2 px-3 bg-white dark:bg-slate-800 rounded-lg border border-gov-border dark:border-slate-700 shadow-sm w-fit">
          <span className="w-2 h-2 rounded-full bg-gov-blue dark:bg-blue-400 animate-pulse" />
          Transcribing voice & synthesizing answer...
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
