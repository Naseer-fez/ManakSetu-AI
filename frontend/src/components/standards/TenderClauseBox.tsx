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
      <div className="flex items-center justify-between text-xs text-gov-text-secondary dark:text-gray-400">
        <div className="flex items-center gap-1.5 font-bold text-gov-navy dark:text-gray-200">
          <FileCode className="w-4 h-4 text-gov-green dark:text-emerald-400" />
          <span>Specification Clause for GeM / CPPP Tenders</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={clsx(
              "flex items-center gap-1 px-3 py-1.5 rounded font-semibold text-xs transition-all shadow-sm",
              copied
                ? "bg-emerald-50 text-gov-green border border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400"
                : "bg-gov-offwhite hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gov-navy dark:text-gray-200 border border-gov-border dark:border-slate-700"
            )}
            title="Copy clause to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Clause"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded bg-gov-offwhite hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white border border-gov-border dark:border-slate-700 transition-colors"
            title="Download clause as .txt"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-gov-offwhite dark:bg-[#0c1626] p-3.5 rounded-lg border border-gov-border dark:border-slate-800 font-mono text-xs leading-relaxed text-gov-text dark:text-gray-300 select-all overflow-x-auto shadow-inner">
        {clauseText}
      </div>
    </div>
  );
};
