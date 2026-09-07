import React, { useState } from "react";
import { FileCode, Copy, Check, Download } from "lucide-react";
import { clsx } from "clsx";

interface TenderClauseBoxProps {
  clauseText: string;
  isCode: string;
}

export const TenderClauseBox: React.FC<TenderClauseBoxProps> = ({ clauseText, isCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(clauseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([clauseText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BIS_Tender_Clause_${isCode.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-1.5 font-semibold text-white/80">
          <FileCode className="w-4 h-4 text-apple-mint" />
          <span>Specification Clause for GeM / CPPP Tenders</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={clsx(
              "flex items-center gap-1 px-3 py-1.5 rounded-xl font-medium text-xs transition-all shadow-sm",
              copied
                ? "bg-apple-mint/20 text-apple-mint border border-apple-mint/40"
                : "bg-white/10 hover:bg-white/20 text-white/90 border border-white/10"
            )}
            title="Copy clause to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Clause"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-colors"
            title="Download clause as .txt"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="apple-glass-dark p-4 rounded-2xl border border-white/10 font-mono text-xs leading-relaxed text-white/85 select-all overflow-x-auto">
        {clauseText}
      </div>
    </div>
  );
};
