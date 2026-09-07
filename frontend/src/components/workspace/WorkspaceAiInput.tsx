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
    <div className="p-3 border-t border-white/10 bg-white/5 shrink-0 backdrop-blur-md">
      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-3.5 py-2 focus-within:border-apple-indigo/60 transition-all shadow-inner">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={fileName ? `Ask about ${fileName}...` : "Ask about tender requirements..."}
          className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-1.5 bg-apple-blue hover:bg-apple-blue/80 disabled:opacity-40 rounded-xl text-white transition-all shadow-md shadow-apple-blue/20 shrink-0"
          title="Send query"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
