import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface GemClauseBoxProps {
  clause: string;
}

export const GemClauseBox: React.FC<GemClauseBoxProps> = ({ clause }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(clause);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-gov-navy dark:text-gray-200">
          Recommended GeM Specification Clause:
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1 text-gov-blue dark:text-blue-400 hover:underline font-medium"
        >
          {copied ? <Check className="w-3 h-3 text-gov-green" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "Copied" : "Copy Clause"}</span>
        </button>
      </div>
      <pre className="bg-gov-offwhite dark:bg-slate-900/70 p-3 rounded border border-gov-border dark:border-slate-700 font-mono text-xs text-gov-text dark:text-gray-200 whitespace-pre-wrap select-all max-h-36 overflow-y-auto">
        {clause}
      </pre>
    </div>
  );
};

export default GemClauseBox;
