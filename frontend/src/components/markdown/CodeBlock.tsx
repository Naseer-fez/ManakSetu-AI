import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { clsx } from "clsx";

export interface CodeBlockProps {
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
    } catch (err: unknown) {
      // Fallback
    }
  };

  const displayLang = (language || "CLAUSE").toUpperCase();

  return (
    <div className={clsx("my-3 rounded border border-gov-border dark:border-slate-700 overflow-hidden bg-gov-offwhite dark:bg-[#0c131d] text-xs font-mono shadow-sm", className)}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-slate-800 border-b border-gov-border dark:border-slate-700">
        <span className="uppercase tracking-wider text-[10px] font-bold text-gov-blue dark:text-blue-400 font-mono">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-gov-green" />
              <span className="text-gov-green font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-gov-text dark:text-gray-200 leading-relaxed font-mono text-xs selection:bg-blue-200 dark:selection:bg-blue-900">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
