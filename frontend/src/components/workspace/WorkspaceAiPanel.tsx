import React, { useRef, useEffect } from "react";
import { Sparkles, X, Trash2, Zap, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { ChatMessage } from "../ChatMessageItem";
import { ChatMessageItem } from "../ChatMessageItem";
import { WorkspaceAiLoading } from "./WorkspaceAiLoading";
import { WorkspaceAiInput } from "./WorkspaceAiInput";

interface WorkspaceAiPanelProps {
  onClose: () => void;
  fileName: string;
  messages: ChatMessage[];
  onSendMessage: (q: string) => void;
  onClearChat: () => void;
  loading: boolean;
  isReady: boolean;
  mode: "fast" | "heavy";
  setMode: (m: "fast" | "heavy") => void;
}

export const WorkspaceAiPanel: React.FC<WorkspaceAiPanelProps> = ({
  onClose,
  fileName,
  messages,
  onSendMessage,
  onClearChat,
  loading,
  isReady,
  mode,
  setMode,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const prompts = ["Explain this clause.", "Why was this marked non-compliant?", "Summarize the audit findings."];

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full min-h-0 apple-glass-dark rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl"
    >
      <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-apple-indigo/20 text-apple-indigo flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>AI Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-apple-mint animate-pulse" />
            </h3>
            <span className="text-[10px] text-white/50 truncate block max-w-[200px]">Grounded: {fileName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onClearChat} className="p-1 rounded-lg text-white/60 hover:text-apple-red hover:bg-apple-red/10 transition-colors" title="Clear chat"><Trash2 className="w-3.5 h-3.5" /></button>
          <button onClick={onClose} className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Close AI Assistant"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="px-3 py-1.5 border-b border-white/5 bg-black/30 flex gap-1.5 text-xs shrink-0">
        <button onClick={() => setMode("fast")} className={clsx("flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-semibold transition-all", mode === "fast" ? "bg-apple-blue text-white" : "text-white/60 hover:text-white")}><Zap className="w-3 h-3 text-apple-amber" /> Fast</button>
        <button onClick={() => setMode("heavy")} className={clsx("flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-semibold transition-all", mode === "heavy" ? "bg-apple-indigo text-white" : "text-white/60 hover:text-white")}><Brain className="w-3 h-3 text-apple-indigo" /> Deep</button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {!isReady ? (
          <WorkspaceAiLoading fileName={fileName} />
        ) : (
          <>
            {messages.map((m, i) => (
              <ChatMessageItem key={i} message={m} loading={loading && i === messages.length - 1 && m.role === "assistant"} />
            ))}
            {messages.length === 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block">Suggested Inquiries</span>
                <div className="flex flex-col gap-1.5">
                  {prompts.map((p, idx) => (
                    <button key={idx} onClick={() => onSendMessage(p)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-left text-white/80 hover:text-white transition-all leading-snug">{p}</button>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <WorkspaceAiInput onSendMessage={onSendMessage} loading={loading} fileName={fileName} />
    </motion.aside>
  );
};
