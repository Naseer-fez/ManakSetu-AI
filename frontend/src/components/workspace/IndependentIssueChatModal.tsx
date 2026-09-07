import React, { useState } from "react";
import { X, Send, AlertTriangle } from "lucide-react";
import { useRemembrance } from "@/context/RemembranceContext";
import { fetchFastAnswer } from "@/services/pipeline.service";

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
    } catch (err: unknown) {
      updateIssueChat(key, [...newMsgs.slice(0, -1), { role: "assistant", text: "Failed to generate issue resolution response." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gov-border dark:border-slate-800 flex items-center justify-between bg-gov-offwhite dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"><AlertTriangle className="w-4 h-4" /></div>
            <div>
              <div className="text-xs font-bold text-gov-navy dark:text-white flex items-center gap-2">
                <span>{activeIssueModal.category}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-red-100 dark:bg-red-950 text-gov-red dark:text-red-400 border border-red-200 dark:border-red-900">{activeIssueModal.severity}</span>
              </div>
              <p className="text-[11px] text-gov-text-secondary dark:text-gray-400 truncate max-w-md">{activeIssueModal.message}</p>
            </div>
          </div>
          <button onClick={() => setActiveIssueModal(null)} className="p-1.5 rounded text-gov-text-secondary hover:text-gov-navy dark:text-gray-400 dark:hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-gov-offwhite dark:bg-[#0a0f18]">
          {messages.map((m, idx) => (
            <div key={idx} className={`p-3 rounded-lg shadow-sm ${m.role === "user" ? "bg-gov-blue text-white ml-8" : "bg-white dark:bg-slate-800/90 text-gov-text dark:text-gray-200 border border-gov-border dark:border-slate-700 mr-8"}`}>
              <div className={`font-semibold mb-1 text-[10px] uppercase ${m.role === "user" ? "text-blue-100" : "text-gov-text-secondary dark:text-gray-400"}`}>{m.role === "user" ? "You" : "Statutory Compliance Assistant"}</div>
              <div className="whitespace-pre-wrap leading-relaxed">{m.text || (loading && idx === messages.length - 1 ? "Analyzing issue..." : "")}</div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-gov-border dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-[#111927]">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask specific questions about this issue..." className="flex-1 bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-gov-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gov-blue" />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="p-2 rounded-lg bg-gov-blue hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-sm"><Send className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
};
