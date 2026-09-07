import React from "react";
import { Sparkles, Send, Trash2 } from "lucide-react";
import type { WorkspaceChatMessage } from "@/components/workspace_desk/types";
import { AskAiMessageList } from "@/components/workspace_desk/AskAiMessageList";

interface AskAiPanelProps {
  messages: WorkspaceChatMessage[];
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  onSendMessage: () => void;
  onClearChat: () => void;
}

export const AskAiPanel: React.FC<AskAiPanelProps> = ({
  messages,
  inputPrompt,
  setInputPrompt,
  onSendMessage,
  onClearChat,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <section className="flex flex-col h-full min-h-0 apple-glass rounded-2xl border border-white/10 overflow-hidden">
      {/* AI Panel Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-apple-blue" />
          <h3 className="text-xs font-semibold text-white">Ask AI (Review Copilot)</h3>
        </div>
        <button
          onClick={onClearChat}
          className="text-white/40 hover:text-white/80 transition-colors p-1 rounded-lg hover:bg-white/5"
          title="Clear chat"
          aria-label="Clear chat messages"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <AskAiMessageList messages={messages} />

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-white/10 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a finding or request rewriting a clause..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-apple-blue transition-colors"
            aria-label="AI message input"
          />
          <button
            onClick={onSendMessage}
            disabled={!inputPrompt.trim()}
            className="px-3 py-2 rounded-xl bg-apple-blue hover:bg-apple-blue/90 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            aria-label="Send message to AI copilot"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
