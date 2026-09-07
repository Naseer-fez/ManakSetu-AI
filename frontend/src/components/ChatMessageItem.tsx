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
        <div className="w-7 h-7 rounded-xl bg-apple-indigo/20 border border-apple-indigo/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-apple-indigo" />
        </div>
      )}
      <div
        className={clsx(
          "max-w-[88%] rounded-2xl px-4 py-3 text-sm transition-all",
          isUser
            ? "bg-apple-blue text-white rounded-br-sm shadow-md shadow-apple-blue/20"
            : "apple-glass-dark border border-white/10 text-white/90 rounded-bl-sm shadow-lg leading-relaxed backdrop-blur-xl"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        ) : (
          <div>
            <MarkdownRenderer
              content={message.text}
              onStandardClick={onStandardClick}
              onFileClick={onFileClick}
            />
            {loading && (
              <span className="inline-block w-2 h-4 ml-1 bg-apple-indigo animate-pulse align-middle rounded-sm" />
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-white/70" />
        </div>
      )}
    </div>
  );
};
