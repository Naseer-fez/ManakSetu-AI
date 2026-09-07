import React, { useRef, useEffect } from "react";
import { Sparkles, X, Trash2, Zap, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { ChatMessage } from "@/components/ChatMessageItem";
import { ChatMessageItem } from "@/components/ChatMessageItem";
import { WorkspaceAiLoading } from "@/components/workspace/WorkspaceAiLoading";
import { WorkspaceAiInput } from "@/components/workspace/WorkspaceAiInput";
import { WorkspaceAiConfirmationCard } from "@/components/workspace/WorkspaceAiConfirmationCard";
import { useRemembrance } from "@/context/RemembranceContext";

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
  onClose, fileName, messages, onSendMessage, onClearChat, loading, isReady, mode, setMode
}) => {
  const { pendingAiAction, setPendingAiAction } = useRemembrance();
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, pendingAiAction]);

  const prompts = ["Explain this clause.", "Why was this marked non-compliant?", "Summarize the audit findings."];

  const handleConfirmAction = () => {
    if (!pendingAiAction) return;
    const prompt = `Analyze statutory finding for ${pendingAiAction.category} (${pendingAiAction.severity} Severity):\n${pendingAiAction.message}\n\nPlease formulate a BIS-compliant corrective action, required testing clauses, and specification adjustments to resolve this issue.`;
    setPendingAiAction(null);
    onSendMessage(prompt);
  };

  return (
    <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded bg-blue-100 dark:bg-blue-950 text-gov-blue dark:text-blue-300 flex items-center justify-center shrink-0"><Sparkles className="w-3.5 h-3.5" /></div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-gov-navy dark:text-white tracking-tight flex items-center gap-1.5">
              <span>AI Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gov-green dark:bg-emerald-400 animate-pulse" />
            </h3>
            <span className="text-[10px] text-gov-text-secondary dark:text-gray-400 truncate block max-w-[200px]">Grounded: {fileName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onClearChat} className="p-1 rounded text-gov-text-secondary hover:text-gov-red dark:text-gray-400 dark:hover:text-red-400 transition-colors" title="Clear chat"><Trash2 className="w-3.5 h-3.5" /></button>
          <button onClick={onClose} className="p-1 rounded text-gov-text-secondary hover:text-gov-navy dark:text-gray-400 dark:hover:text-white transition-colors" title="Close AI Assistant"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="px-3 py-1.5 border-b border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/40 flex gap-1.5 text-xs shrink-0">
        <button onClick={() => setMode("fast")} className={clsx("flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-semibold transition-all", mode === "fast" ? "bg-gov-blue text-white shadow-sm" : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white")}><Zap className="w-3 h-3 text-gov-saffron" /> Fast</button>
        <button onClick={() => setMode("heavy")} className={clsx("flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-semibold transition-all", mode === "heavy" ? "bg-gov-navy dark:bg-blue-600 text-white shadow-sm" : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white")}><Brain className="w-3 h-3 text-gov-saffron" /> Deep</button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gov-offwhite dark:bg-[#0a0f18]">
        {!isReady ? (
          <WorkspaceAiLoading fileName={fileName} />
        ) : (
          <>
            {messages.map((m, i) => (
              <ChatMessageItem key={i} message={m} loading={loading && i === messages.length - 1 && m.role === "assistant"} />
            ))}
            {pendingAiAction && (
              <WorkspaceAiConfirmationCard action={pendingAiAction} onConfirm={handleConfirmAction} onCancel={() => setPendingAiAction(null)} />
            )}
            {messages.length === 0 && !pendingAiAction && (
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-bold text-gov-navy dark:text-gray-200 uppercase tracking-wider block">Suggested Inquiries</span>
                <div className="flex flex-col gap-1.5">
                  {prompts.map((p, idx) => (
                    <button key={idx} onClick={() => onSendMessage(p)} className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gov-border dark:border-slate-700 text-xs text-left text-gov-text dark:text-gray-200 transition-all leading-snug shadow-sm">{p}</button>
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
