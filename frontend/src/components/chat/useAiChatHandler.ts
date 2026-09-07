import { useState } from "react";
import { fetchFastAnswer, fetchHeavyReasoning } from "@/services/pipeline.service";
import { useRemembrance } from "@/context/RemembranceContext";

export function useAiChatHandler(propPdfText?: string) {
  const rem = useRemembrance();
  const {
    chatMode: mode,
    chatMessages: messages,
    setChatMessages: setMessages,
    chatInput: input,
    setChatInput: setInput,
    isPdfConnectedToAiChat,
    pdfText: remPdfText,
    analysis,
    file,
  } = rem;

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        text: "Chat cleared. Ask anything regarding BIS specifications, QCO orders, or GeM compliance.",
      },
    ]);
    setAttachedFile(null);
  };

  const handleSend = async (customQuery?: string) => {
    const q =
      (customQuery || input).trim() ||
      (attachedFile ? `Analyze attached file ${attachedFile.name}` : "");
    if (!q || loading) return;
    const fileToSend = attachedFile;
    setInput("");
    setAttachedFile(null);
    setLoading(true);

    const activePdf = isPdfConnectedToAiChat
      ? propPdfText || remPdfText || undefined
      : undefined;
    const chatHistory = messages.map((m) => ({ role: m.role, content: m.text }));
    const userLabel = fileToSend ? `${q}\n\n📎 *[Attached: ${fileToSend.name}]*` : q;
    setMessages((prev) => [...prev, { role: "user", text: userLabel }, { role: "assistant", text: "" }]);

    try {
      const res = mode === "fast"
        ? await fetchFastAnswer(q, fileToSend || undefined, activePdf)
        : await fetchHeavyReasoning(q, fileToSend || undefined, activePdf, chatHistory, false);

      setMessages((prev) =>
        prev.length ? [...prev.slice(0, -1), { role: "assistant", text: res.answer }] : prev
      );
    } catch (err: unknown) {
      setMessages((prev) =>
        prev.length
          ? [...prev.slice(0, -1), { role: "assistant", text: "Reasoning engine unavailable. Please check backend connection." }]
          : prev
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTransferFindings = () => {
    if (!analysis?.compliance_run?.findings?.length) return;
    const items = analysis.compliance_run.findings
      .slice(0, 5)
      .map((f) => `- [${f.severity}] ${f.category}: ${f.message}`)
      .join("\n");
    handleSend(
      `Analyze these statutory findings from ${file?.name || "the tender"}:\n${items}\nHow to resolve?`
    );
  };

  return {
    attachedFile,
    setAttachedFile,
    loading,
    handleClear,
    handleTransferFindings,
    handleSend,
    mode,
    setMode: rem.setChatMode,
    messages,
    input,
    setInput,
  };
}
