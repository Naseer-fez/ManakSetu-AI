import React from "react";
import { clsx } from "clsx";
import { Sparkles, User } from "lucide-react";
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

  return (
    <div className={clsx("flex w-full gap-2.5 items-start", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-7 h-7 rounded bg-gov-navy dark:bg-slate-800 border border-transparent dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
        </div>
      )}
      <div
        className={clsx(
          "max-w-[88%] rounded-lg px-4 py-3 text-xs leading-relaxed transition-all",
          isUser
            ? "bg-gov-blue text-white shadow-sm"
            : "bg-white dark:bg-slate-800/95 border border-gov-border dark:border-slate-700 text-gov-text dark:text-gray-100 shadow-sm"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed font-normal">{message.text}</p>
        ) : (
          <div>
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
