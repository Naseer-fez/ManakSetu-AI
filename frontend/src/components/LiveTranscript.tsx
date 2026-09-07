import React, { useEffect, useRef } from "react";
import { Bot, Mic } from "lucide-react";

interface LiveTranscriptProps {
  turns: Array<{ role: "user" | "assistant"; text: string }>;
  currentTranscript: string;
  currentResponse: string;
  isProcessing: boolean;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({ turns, currentTranscript, currentResponse, isProcessing }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, currentTranscript, currentResponse, isProcessing]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] min-h-[200px] mt-4 pr-2">
      {turns.map((t, i) => (
        <div key={i} className={`flex gap-3 ${t.role === "user" ? "justify-end" : "justify-start"}`}>
          {t.role === "assistant" && (
            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
          )}
          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md ${
            t.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "apple-glass text-slate-200 border border-white/10 rounded-bl-none"
          }`}>
            <p className="leading-relaxed whitespace-pre-wrap">{t.text}</p>
          </div>
          {t.role === "user" && (
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 flex-shrink-0 mt-1">
              <Mic className="w-4 h-4" />
            </div>
          )}
        </div>
      ))}
      
      {(currentTranscript || currentResponse) && (
        <div className="space-y-4">
          {currentTranscript && (
            <div className="flex gap-3 justify-end opacity-80">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md bg-blue-600/50 border border-blue-500/30 text-white rounded-br-none">
                <p className="leading-relaxed whitespace-pre-wrap">{currentTranscript}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 flex-shrink-0 mt-1">
                <Mic className="w-4 h-4" />
              </div>
            </div>
          )}
          {currentResponse && (
            <div className="flex gap-3 justify-start opacity-80">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md apple-glass text-slate-200 border border-white/10 rounded-bl-none">
                <p className="leading-relaxed whitespace-pre-wrap">{currentResponse}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {isProcessing && !currentResponse && (
        <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-3 apple-glass rounded-xl w-fit">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Processing...
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
