import React, { useState } from "react";
import { clsx } from "clsx";
import { Sparkles, User, Copy, Check } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface ChatMessageItemProps {
  message: ChatMessage;
  loading?: boolean;
  onStandardClick?: (isCode: string) => void;
  onFileClick?: (filename: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  loading,
  onStandardClick,
  onFileClick,
}) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={clsx("flex w-full gap-2.5 items-start group", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-7 h-7 rounded bg-gov-navy dark:bg-slate-800 border border-transparent dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
        </div>
      )}
      <div
        className={clsx(
          "max-w-[88%] rounded-xl px-4 py-3 text-xs leading-relaxed transition-all relative",
          isUser
            ? "bg-gov-blue text-white shadow-sm"
            : "bg-white dark:bg-slate-800/95 border border-gov-border dark:border-slate-700 text-gov-text dark:text-gray-100 shadow-sm"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed font-normal">{message.text}</p>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-100 dark:border-slate-700/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gov-blue dark:text-blue-400">BIS Intelligence Copilot</span>
              {message.text && !loading && (
                <button onClick={handleCopy} className="text-gray-400 hover:text-gov-navy dark:hover:text-white p-0.5 rounded transition-colors" title="Copy response">
                  {copied ? <Check className="w-3 h-3 text-gov-green" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
            <MarkdownRenderer
              content={message.text}
              onStandardClick={onStandardClick}
              onFileClick={onFileClick}
            />
            {loading && (
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-gov-blue animate-pulse align-middle rounded-sm" />
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded bg-gov-blue-light dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-gov-blue dark:text-blue-400" />
        </div>
      )}
    </div>
  );
};
