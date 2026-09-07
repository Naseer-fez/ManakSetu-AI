import React, { useRef } from "react";
import { Send, Paperclip, X, FileText } from "lucide-react";

interface ChatInputBarProps {
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

  return (
    <footer className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md space-y-2">
      {attachedFile && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-apple-indigo/20 border border-apple-indigo/40 w-fit text-xs text-white">
          <FileText className="w-3.5 h-3.5 text-apple-indigo" />
          <span className="font-medium max-w-[220px] truncate">{attachedFile.name}</span>
          <span className="text-[10px] text-white/50">({Math.round(attachedFile.size / 1024)} KB)</span>
          <button
            type="button"
            onClick={() => onAttachFile?.(null)}
            className="p-0.5 hover:text-apple-red transition-colors ml-1"
            title="Remove attachment"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 sm:gap-3 bg-black/40 border border-white/10 rounded-2xl px-3 sm:px-4 py-2 focus-within:border-apple-indigo/60 transition-all shadow-inner">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.md,.markdown,.txt"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title="Attach PDF or Markdown (.md) document"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSend()}
          placeholder={
            attachedFile
              ? `Ask inquiry about ${attachedFile.name}...`
              : mode === "fast"
              ? "Ask quick standards inquiry (e.g. 'Is IS 1786 mandatory under QCO?')..."
              : "Ask deep reasoning inquiry with normative citations and compliance checks..."
          }
          className="flex-1 bg-transparent text-sm text-white placeholder-white/35 focus:outline-none"
        />
        <button
          onClick={onSend}
          disabled={loading || (!input.trim() && !attachedFile)}
          type="button"
          className="px-4 py-2 rounded-xl bg-apple-blue hover:bg-apple-blue/80 disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-md shadow-apple-blue/20 flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
