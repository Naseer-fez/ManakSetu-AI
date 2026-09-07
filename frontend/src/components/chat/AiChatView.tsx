import React, { useRef, useEffect } from "react";
import { ChatMessageItem } from "@/components/ChatMessageItem";
import { ChatViewHeader } from "@/components/chat/ChatViewHeader";
import { ChatPdfContextBanner } from "@/components/chat/ChatPdfContextBanner";
import { ChatSuggestedTopics } from "@/components/chat/ChatSuggestedTopics";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { STARTER_PROMPTS } from "@/components/chat/chat.constants";
import { useAiChatHandler } from "@/components/chat/useAiChatHandler";

export interface AiChatViewProps {
  pdfText?: string;
  onNavigateToStandard?: (isCode: string) => void;
}

export const AiChatView: React.FC<AiChatViewProps> = ({ pdfText: propPdfText, onNavigateToStandard }) => {
  const {
    attachedFile,
    setAttachedFile,
    loading,
    handleClear,
    handleTransferFindings,
    handleSend,
    mode,
    setMode,
    messages,
    input,
    setInput,
  } = useAiChatHandler(propPdfText);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="w-full flex-1 max-w-5xl mx-auto flex flex-col h-full rounded-lg bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 shadow-sm overflow-hidden">
      <ChatViewHeader mode={mode} setMode={setMode} onClear={handleClear} />
      <ChatPdfContextBanner onTransferFindings={handleTransferFindings} />

      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gov-offwhite dark:bg-[#0a0f18]">
        {messages.map((m, i) => (
          <ChatMessageItem
            key={i}
            message={m}
            loading={loading && i === messages.length - 1 && m.role === "assistant"}
            onStandardClick={onNavigateToStandard}
          />
        ))}

        {messages.length === 1 && (
          <ChatSuggestedTopics prompts={STARTER_PROMPTS} onSelectPrompt={handleSend} />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-[#111927] border-t border-gov-border dark:border-slate-800">
        <ChatInputBar
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          loading={loading}
          mode={mode}
          attachedFile={attachedFile}
          onAttachFile={setAttachedFile}
        />
      </div>
    </div>
  );
};

export default AiChatView;
