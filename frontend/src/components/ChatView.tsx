import React, { useState, useRef, useEffect } from "react";
import { fetchFastAnswer, fetchHeavyReasoning } from "@/services/pipeline.service";
import { ChatMessageItem } from "@/components/ChatMessageItem";
import { ChatViewHeader } from "@/components/chat/ChatViewHeader";
import { ChatPdfContextBanner } from "@/components/chat/ChatPdfContextBanner";
import { ChatSuggestedTopics } from "@/components/chat/ChatSuggestedTopics";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { STARTER_PROMPTS } from "@/components/chat/chat.constants";
import { useRemembrance } from "@/context/RemembranceContext";

interface ChatViewProps {
  pdfText?: string;
  onNavigateToStandard?: (isCode: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ pdfText: propPdfText, onNavigateToStandard }) => {
  const rem = useRemembrance();
  const { chatMode: mode, setChatMode: setMode, chatMessages: messages, setChatMessages: setMessages,
    chatInput: input, setChatInput: setInput, isPdfConnectedToAiChat, pdfText: remPdfText, analysis, file } = rem;
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleClear = () => {
    setMessages([{ role: "assistant", text: "Chat cleared. Start a fresh conversation about Indian Standards, materials, or tender compliance." }]);
    setAttachedFile(null);
  };

  const handleTransferFindings = () => {
    if (!analysis?.compliance_run?.findings?.length) return;
    const items = analysis.compliance_run.findings.slice(0, 5).map(f => `- [${f.severity}] ${f.category}: ${f.message}`).join("\n");
    handleSend(`Please analyze these statutory findings from ${file?.name || "the tender"}:\n${items}\nHow can we resolve these violations?`);
  };

  const handleSend = async (customQuery?: string) => {
    const q = (customQuery || input).trim() || (attachedFile ? `Analyze the attached file ${attachedFile.name}` : "");
    if (!q || loading) return;
    const fileToSend = attachedFile;
    setInput(""); setAttachedFile(null); setLoading(true);

    const activePdf = isPdfConnectedToAiChat ? (propPdfText || remPdfText || undefined) : undefined;
    const chatHistory = messages.map(m => ({ role: m.role, content: m.text }));
    const userLabel = fileToSend ? `${q}\n\n📎 *[Attached: ${fileToSend.name}]*` : q;
    setMessages(prev => [...prev, { role: "user", text: userLabel }, { role: "assistant", text: "" }]);

    try {
      const res = mode === "fast"
        ? await fetchFastAnswer(q, fileToSend || undefined, activePdf)
        : await fetchHeavyReasoning(q, fileToSend || undefined, activePdf, chatHistory, false);

      setMessages(prev => prev.length ? [...prev.slice(0, -1), { role: "assistant", text: res.answer }] : prev);
    } catch {
      setMessages(prev => prev.length ? [...prev.slice(0, -1), { role: "assistant", text: "AI reasoning service is currently unavailable. Check backend/Mac status." }] : prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 mx-auto flex flex-col h-full rounded-3xl apple-glass border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl">
      <ChatViewHeader mode={mode} setMode={setMode} onClear={handleClear} />
      <ChatPdfContextBanner onTransferFindings={handleTransferFindings} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
  );
};
