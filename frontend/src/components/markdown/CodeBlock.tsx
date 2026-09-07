import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { clsx } from "clsx";

interface CodeBlockProps {
  language?: string;
  code: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API fails
    }
  };

  const displayLang = (language || "CODE").toUpperCase();

  return (
    <div className={clsx("my-3 rounded-2xl overflow-hidden border border-white/10 bg-black/50 text-xs font-mono shadow-lg", className)}>
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/5 border-b border-white/10 text-white/60">
        <span className="uppercase tracking-wider text-[10px] font-semibold text-apple-indigo font-mono">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-apple-mint" />
              <span className="text-apple-mint font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-white/90 leading-relaxed font-mono text-xs selection:bg-apple-blue selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};
