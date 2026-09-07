import { useState } from "react";
import { fetchFastAnswer, fetchHeavyReasoning, refreshChatContext } from "@/services/pipeline.service";
import { useRemembrance } from "@/context/RemembranceContext";
import type { ChatMessage } from "@/components/ChatMessageItem";

export function useAssistantChatDrawer(propPdfText?: string) {
  const rem = useRemembrance();
  const effectivePdfText = propPdfText || (rem.isPdfConnectedToAiChat ? rem.pdfText : undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"fast" | "heavy">("heavy");
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hello! I am your BIS AI Assistant. Ask me anything about Indian Standards, QCO orders, or tender clauses." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleClear = () => {
    setMessages([
      { role: "assistant", text: "Chat cleared. Ask me anything about Indian Standards or tender specifications." },
    ]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("bis_specai_chat_history");
      } catch {
        // ignore storage errors
      }
    }
  };

  const handleRefresh = async () => {
    if (messages.length <= 1 || refreshing) return;
    setRefreshing(true);
    try {
      const summary = await refreshChatContext(messages.map(m => ({ role: m.role, content: m.text })));
      if (summary) setMessages([{ role: "assistant", text: `[Context Compressed]: ${summary}` }]);
    } catch (err: unknown) {
      // Keep existing history on refresh failure
    } finally { setRefreshing(false); }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const q = input; setInput(""); setLoading(true); setSpeaking(true);
    const boundedMessages = messages.slice(-6);
    const chatHistory = boundedMessages.map(m => ({ role: m.role, content: m.text }));
    setMessages(p => [...p, { role: "user", text: q }, { role: "assistant", text: "" }]);

    try {
      const res = mode === "fast"
        ? await fetchFastAnswer(q, undefined, effectivePdfText)
        : await fetchHeavyReasoning(q, undefined, effectivePdfText, chatHistory, false);

      setMessages(prev => {
        if (!prev.length) return prev;
        return [...prev.slice(0, prev.length - 1), { role: "assistant", text: res.answer }];
      });
    } catch (err: unknown) {
      setMessages(prev => {
        if (!prev.length) return prev;
        return [...prev.slice(0, prev.length - 1), { role: "assistant", text: "AI reasoning service is currently unavailable. Please check system status." }];
      });
    } finally {
      setLoading(false);
      setTimeout(() => setSpeaking(false), 2000);
    }
  };

  return {
    isOpen, setIsOpen, mode, setMode, refreshing, messages, input, setInput,
    loading, speaking, handleClear, handleRefresh, handleSend,
  };
}
