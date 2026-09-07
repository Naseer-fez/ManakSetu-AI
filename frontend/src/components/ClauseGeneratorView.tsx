import React, { useState } from "react";
import { Copy, Check, Download, FileCode, Shield, Sparkles, Loader2 } from "lucide-react";
import type { StandardRecommendation } from "@/types";
import { generateTenderClauses } from "@/services/api.service";

interface ClauseGeneratorViewProps {
  rec: StandardRecommendation;
}

export const ClauseGeneratorView: React.FC<ClauseGeneratorViewProps> = ({ rec }) => {
  const [copied, setCopied] = useState(false);
  const [clauseText, setClauseText] = useState(rec.sample_tender_clause);
  const [generating, setGenerating] = useState(false);
  const std = rec.standard;

  const handleGenerateAi = async () => {
    try {
      setGenerating(true);
      const res = await generateTenderClauses(std.is_code);
      if (res.clause_text) setClauseText(res.clause_text);
    } catch (err: unknown) {
      // Retain fallback clause if AI generation fails
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
    link.download = `GeM_Tender_Clause_${std.is_code.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-gov-border dark:border-slate-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-gov-border dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-gov-green dark:text-emerald-400" />
          <h4 className="text-sm font-bold text-gov-navy dark:text-white">
            GeM / CPPP Specification Clause Builder
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAi}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 text-gov-green dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 transition-all disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-gov-green dark:text-emerald-400" />}
            <span>{generating ? "AI Drafting..." : "AI Generate"}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gov-offwhite hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gov-text dark:text-slate-200 border border-gov-border dark:border-slate-700 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-gov-green dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Clause"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 text-gov-blue dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="bg-gov-offwhite dark:bg-slate-950 p-4 rounded-lg border border-gov-border dark:border-slate-800/80 font-mono text-[11px] leading-relaxed text-gov-text dark:text-slate-300 whitespace-pre-wrap select-all">
        {clauseText}
      </div>

      <div className="flex items-start gap-2 text-xs text-gov-amber dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-lg">
        <Shield className="w-4 h-4 text-gov-amber dark:text-amber-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Statutory Advisory: </span>
          <span>{rec.certification_alert}</span>
        </div>
      </div>
    </div>
  );
};
