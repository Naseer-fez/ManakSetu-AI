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
    <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3">
      {messages.map((m) => {
        const isUser = m.role === "user";
        return (
          <div key={m.id} className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && (
              <div className="w-6 h-6 rounded-full bg-apple-blue/20 text-apple-blue flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                isUser
                  ? "bg-apple-blue text-white rounded-br-none"
                  : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              <span className="text-[9px] block text-right mt-1 opacity-50">{m.timestamp}</span>
            </div>
            {isUser && (
              <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
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
