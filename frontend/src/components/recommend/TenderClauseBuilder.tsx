import React, { useState } from "react";
import { Copy, Check, Download, Sparkles, Loader2, FileText, AlertTriangle } from "lucide-react";
import { generateTenderClauses } from "@/services/api.service";

export interface TenderClauseBuilderProps {
  isCode: string;
  initialClause: string;
  certificationAlert?: string;
}

export const TenderClauseBuilder: React.FC<TenderClauseBuilderProps> = ({
  isCode,
  initialClause,
  certificationAlert,
}) => {
  const [copied, setCopied] = useState(false);
  const [clauseText, setClauseText] = useState(initialClause);
  const [generating, setGenerating] = useState(false);

  const handleGenerateAi = async () => {
    try {
      setGenerating(true);
      const res = await generateTenderClauses(isCode);
      if (res.clause_text) setClauseText(res.clause_text);
    } catch (err: unknown) {
      // Retain existing clause if API is unavailable
    } finally {
      setGenerating(false);
    }
  };

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
    link.download = `Tender_Clause_${isCode.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gov-offwhite dark:bg-slate-900/60 border border-gov-border dark:border-slate-800 rounded-lg p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-1.5 text-gov-navy dark:text-white font-semibold text-xs">
          <FileText className="w-4 h-4 text-gov-blue dark:text-blue-400" />
          <span>GeM / CPPP Tender Specification Clause</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleGenerateAi}
            disabled={generating}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-gov-blue-light dark:hover:bg-slate-700 text-gov-blue dark:text-blue-400 border border-gov-blue dark:border-blue-700 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            <span>{generating ? "Drafting..." : "AI Expand"}</span>
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-gov-offwhite dark:hover:bg-slate-700 text-gov-text dark:text-gray-200 border border-gov-border dark:border-slate-700 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-gov-green" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-gov-offwhite dark:hover:bg-slate-700 text-gov-text dark:text-gray-200 border border-gov-border dark:border-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>TXT</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0c131d] p-3 rounded border border-gov-border dark:border-slate-800 font-mono text-xs leading-relaxed text-gov-text dark:text-gray-200 whitespace-pre-wrap select-all max-h-48 overflow-y-auto">
        {clauseText}
      </div>

      {certificationAlert && (
        <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-2.5 rounded">
          <AlertTriangle className="w-3.5 h-3.5 text-gov-amber mt-0.5 shrink-0" />
          <span><strong>Statutory Mandate:</strong> {certificationAlert}</span>
        </div>
      )}
    </div>
  );
};

export default TenderClauseBuilder;
