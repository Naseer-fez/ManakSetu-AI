import React, { useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";
import type { WorkspaceChatMessage } from "@/components/workspace_desk/types";

interface AskAiMessageListProps {
  messages: WorkspaceChatMessage[];
}

export const AskAiMessageList: React.FC<AskAiMessageListProps> = ({ messages }) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 bg-gov-offwhite dark:bg-[#0a0f18]">
      {messages.map((m) => {
        const isUser = m.role === "user";
        return (
          <div key={m.id} className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && (
              <div className="w-6 h-6 rounded bg-gov-navy dark:bg-slate-700 text-gov-saffron dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                isUser
                  ? "bg-gov-blue text-white rounded-br-none"
                  : "bg-white dark:bg-slate-800/90 border border-gov-border dark:border-slate-700 text-gov-text dark:text-gray-100 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              <span className="text-[9px] block text-right mt-1 opacity-60">{m.timestamp}</span>
            </div>
            {isUser && (
              <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-950 text-gov-blue dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        );
      })}
      <div ref={scrollEndRef} />
    </div>
  );
};
