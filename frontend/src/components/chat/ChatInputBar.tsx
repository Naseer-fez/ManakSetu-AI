import React, { useRef } from "react";
import { Send, Paperclip, X, FileText } from "lucide-react";

export interface ChatInputBarProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  mode: "fast" | "heavy";
  attachedFile?: File | null;
  onAttachFile?: (file: File | null) => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  input,
  setInput,
  onSend,
  loading,
  mode,
  attachedFile,
  onAttachFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAttachFile) onAttachFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    onSend();
    if (textareaRef.current) textareaRef.current.style.height = "36px";
  };

  return (
    <div className="space-y-2 select-none">
      {attachedFile && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 w-fit text-xs text-gov-navy dark:text-blue-300">
          <FileText className="w-3.5 h-3.5 text-gov-blue" />
          <span className="font-semibold max-w-[220px] truncate">{attachedFile.name}</span>
          <span className="text-[10px] text-gov-text-secondary dark:text-gray-400">({Math.round(attachedFile.size / 1024)} KB)</span>
          <button type="button" onClick={() => onAttachFile?.(null)} className="p-0.5 hover:text-gov-red transition-colors ml-1" title="Remove attachment"><X className="w-3 h-3" /></button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-gov-offwhite dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-gov-blue transition-all">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.md,.markdown,.txt" className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 mb-0.5 rounded text-gov-text-secondary hover:text-gov-navy dark:text-gray-400 dark:hover:text-white transition-colors" title="Attach PDF or specification text">
          <Paperclip className="w-4 h-4" />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
              const sH = textareaRef.current.scrollHeight;
              textareaRef.current.style.height = `${Math.min(Math.max(sH, 36), 140)}px`;
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            attachedFile
              ? `Ask question regarding ${attachedFile.name}... (Shift+Enter for newline)`
              : mode === "fast"
              ? "Ask an advisory query (e.g. 'Is IS 1786 mandatory under QCO?')..."
              : "Ask a deep analytical query with normative standard dependencies..."
          }
          className="flex-1 bg-transparent text-xs text-gov-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none py-1.5 leading-relaxed max-h-[140px] overflow-y-auto"
          style={{ height: "36px" }}
        />
        <button
          onClick={handleSend}
          disabled={loading || (!input.trim() && !attachedFile)}
          type="button"
          className="px-3.5 py-1.5 mb-0.5 rounded bg-gov-blue hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInputBar;
