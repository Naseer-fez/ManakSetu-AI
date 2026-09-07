import React, { useState } from "react";
import { X, Send, AlertTriangle } from "lucide-react";
import { useRemembrance } from "../../context/RemembranceContext";
import { fetchFastAnswer } from "../../services/pipeline.service";

export const IndependentIssueChatModal: React.FC = () => {
  const { activeIssueModal, setActiveIssueModal, issueChats, updateIssueChat } = useRemembrance();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!activeIssueModal) return null;

  const key = activeIssueModal.key;
  const messages = issueChats[key] || [
    {
      role: "assistant",
      text: `Focused AI Assistant initialized for: **${activeIssueModal.category}** (${activeIssueModal.severity} Severity).\n\n*Issue Details:*\n> ${activeIssueModal.message}\n\nAsk me any question strictly about resolving this statutory violation.`,
    },
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userQuery = input.trim();
    setInput("");
    const newMsgs = [...messages, { role: "user" as const, text: userQuery }, { role: "assistant" as const, text: "" }];
    updateIssueChat(key, newMsgs);
    setLoading(true);

    try {
      const prompt = `Issue Context: [Category: ${activeIssueModal.category}, Severity: ${activeIssueModal.severity}]\nIssue Message: ${activeIssueModal.message}\nCorrective Action: ${activeIssueModal.correctiveAction || "None specified"}\n\nUser Question: ${userQuery}`;
      const res = await fetchFastAnswer(prompt);
      updateIssueChat(key, [...newMsgs.slice(0, -1), { role: "assistant", text: res.answer }]);
    } catch {
      updateIssueChat(key, [...newMsgs.slice(0, -1), { role: "assistant", text: "Failed to generate issue resolution response." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-2xl apple-glass rounded-3xl border border-white/20 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-apple-amber/20 text-apple-amber"><AlertTriangle className="w-4 h-4" /></div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{activeIssueModal.category}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-apple-red/20 text-apple-red">{activeIssueModal.severity}</span>
              </div>
              <p className="text-[11px] text-white/50 truncate max-w-md">{activeIssueModal.message}</p>
            </div>
          </div>
          <button onClick={() => setActiveIssueModal(null)} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`p-3 rounded-2xl ${m.role === "user" ? "bg-apple-blue/20 text-white border border-apple-blue/30 ml-8" : "bg-white/5 text-white/80 border border-white/10 mr-8"}`}>
              <div className="font-semibold mb-1 text-[10px] text-white/40 uppercase">{m.role === "user" ? "You" : "Issue AI Assistant"}</div>
              <div className="whitespace-pre-wrap leading-relaxed">{m.text || (loading && idx === messages.length - 1 ? "Analyzing issue..." : "")}</div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/40">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask specific questions about this issue..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-apple-blue" />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="p-2 rounded-xl bg-apple-blue hover:bg-apple-blue/80 text-white disabled:opacity-40 transition-colors"><Send className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
};
