import React, { useState } from "react";
import { Send } from "lucide-react";

interface WorkspaceAiInputProps {
  onSendMessage: (q: string) => void;
  loading: boolean;
  fileName?: string;
}

export const WorkspaceAiInput: React.FC<WorkspaceAiInputProps> = ({
  onSendMessage,
  loading,
  fileName,
}) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    onSendMessage(q);
  };

  return (
    <div className="p-3 border-t border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/50 shrink-0">
      <div className="flex items-center gap-2 bg-white dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-gov-blue transition-all shadow-sm">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={fileName ? `Ask about ${fileName}...` : "Ask about tender requirements..."}
          className="flex-1 bg-transparent text-xs text-gov-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-1.5 bg-gov-blue hover:bg-blue-700 disabled:opacity-40 rounded text-white transition-all shadow-sm shrink-0"
          title="Send query"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
