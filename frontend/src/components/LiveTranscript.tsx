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
    <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] min-h-[200px] mt-4 pr-2 bg-gov-offwhite dark:bg-[#0a0f18] p-4 rounded-lg">
      {turns.map((t, i) => (
        <div key={i} className={`flex gap-3 ${t.role === "user" ? "justify-end" : "justify-start"}`}>
          {t.role === "assistant" && (
            <div className="w-8 h-8 rounded bg-gov-navy dark:bg-slate-700 text-gov-saffron dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
          )}
          <div className={`max-w-[80%] rounded-lg px-4 py-3 text-xs shadow-sm leading-relaxed ${
            t.role === "user" ? "bg-gov-blue text-white rounded-br-none" : "bg-white dark:bg-slate-800/90 text-gov-text dark:text-gray-100 border border-gov-border dark:border-slate-700 rounded-bl-none"
          }`}>
            <p className="leading-relaxed whitespace-pre-wrap">{t.text}</p>
          </div>
          {t.role === "user" && (
            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-950 text-gov-blue dark:text-blue-300 flex items-center justify-center flex-shrink-0 mt-1">
              <Mic className="w-4 h-4" />
            </div>
          )}
        </div>
      ))}
      
      {(currentTranscript || currentResponse) && (
        <div className="space-y-4">
          {currentTranscript && (
            <div className="flex gap-3 justify-end opacity-80">
              <div className="max-w-[80%] rounded-lg px-4 py-3 text-xs shadow-sm bg-blue-600 text-white rounded-br-none">
                <p className="leading-relaxed whitespace-pre-wrap">{currentTranscript}</p>
              </div>
              <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-950 text-gov-blue dark:text-blue-300 flex items-center justify-center flex-shrink-0 mt-1">
                <Mic className="w-4 h-4" />
              </div>
            </div>
          )}
          {currentResponse && (
            <div className="flex gap-3 justify-start opacity-80">
              <div className="w-8 h-8 rounded bg-gov-navy dark:bg-slate-700 text-gov-saffron dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-[80%] rounded-lg px-4 py-3 text-xs shadow-sm bg-white dark:bg-slate-800/90 text-gov-text dark:text-gray-100 border border-gov-border dark:border-slate-700 rounded-bl-none">
                <p className="leading-relaxed whitespace-pre-wrap">{currentResponse}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {isProcessing && !currentResponse && (
        <div className="flex items-center gap-2 text-gov-text-secondary dark:text-gray-300 text-xs py-2 px-3 bg-white dark:bg-slate-800 rounded-lg border border-gov-border dark:border-slate-700 shadow-sm w-fit">
          <span className="w-2 h-2 rounded-full bg-gov-blue dark:bg-blue-400 animate-pulse" />
          Processing voice input...
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
