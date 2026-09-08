import React from "react";
import { Sparkles, Send, Trash2, X } from "lucide-react";
import type { WorkspaceChatMessage } from "@/components/workspace_desk/types";
import { AskAiMessageList } from "@/components/workspace_desk/AskAiMessageList";

interface AskAiPanelProps {
  messages: WorkspaceChatMessage[];
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  onSendMessage: () => void;
  onClearChat: () => void;
  onClose?: () => void;
}

export const AskAiPanel: React.FC<AskAiPanelProps> = ({
  messages,
  inputPrompt,
  setInputPrompt,
  onSendMessage,
  onClearChat,
  onClose,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <section className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-sm overflow-hidden">
      {/* AI Panel Header */}
      <div className="px-4 py-2.5 border-b border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gov-blue dark:text-blue-400" />
          <h3 className="text-xs font-bold text-gov-navy dark:text-white">Review Copilot AI</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClearChat}
            className="text-gov-text-secondary hover:text-gov-red dark:text-gray-400 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-white dark:hover:bg-slate-800"
            title="Clear chat"
            aria-label="Clear chat messages"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gov-text-secondary hover:text-gov-navy dark:text-gray-400 dark:hover:text-white transition-colors p-1 rounded hover:bg-white dark:hover:bg-slate-800"
              title="Close Copilot Panel"
              aria-label="Close Copilot Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <AskAiMessageList messages={messages} />

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a finding or request rewriting a clause..."
            className="flex-1 bg-white dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-gov-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gov-blue transition-colors"
            aria-label="AI message input"
          />
          <button
            onClick={onSendMessage}
            disabled={!inputPrompt.trim()}
            className="px-3.5 py-2 rounded-lg bg-gov-blue hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            aria-label="Send message to AI copilot"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
