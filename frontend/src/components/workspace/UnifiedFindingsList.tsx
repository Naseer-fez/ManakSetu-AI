import React, { useState } from "react";
import { AlertTriangle, BookOpen, Copy, Check, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { useRemembrance } from "@/context/RemembranceContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface FindingItem {
  severity: string;
  state: string;
  category: string;
  message: string;
}

interface UnifiedFindingsListProps {
  findings: FindingItem[];
  completeSpecClause?: string;
}

export const UnifiedFindingsList: React.FC<UnifiedFindingsListProps> = ({
  findings,
  completeSpecClause,
}) => {
  const { setPendingAiAction } = useRemembrance();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!completeSpecClause) return;
    navigator.clipboard.writeText(completeSpecClause);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Statutory Findings Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-gov-navy dark:text-gray-200 px-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gov-amber dark:text-amber-400" />
            <span>Statutory Compliance Findings ({findings.length})</span>
          </div>
          <span className="text-[10px] text-gov-text-secondary dark:text-gray-400">Audit Verdicts</span>
        </div>

        <div className="space-y-2.5">
          {findings.map((item, idx) => {
            const cleanCategory = item.category.replace(/^\*+\s*|\*+/g, "").trim();
            return (
              <div key={idx} className="p-3.5 rounded-lg bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 space-y-2 transition-all shadow-2xs hover:border-gray-300 dark:hover:border-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gov-navy dark:text-white truncate">{cleanCategory}</span>
                  <span className={clsx("text-[10px] px-2 py-0.5 rounded font-bold uppercase border", item.severity.toLowerCase() === "high" ? "bg-red-50 dark:bg-red-950/40 text-gov-red dark:text-rose-400 border-red-200 dark:border-red-900/50" : "bg-amber-50 dark:bg-amber-950/40 text-gov-amber dark:text-amber-400 border-amber-200 dark:border-amber-900/50")}>
                    {item.severity} Severity
                  </span>
                </div>
                <div className="text-xs text-gov-text dark:text-gray-300 leading-relaxed bg-gov-offwhite dark:bg-[#0c1421] p-2.5 rounded border border-gov-border dark:border-slate-800">
                  <MarkdownRenderer content={item.message} className="text-xs leading-relaxed" />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setPendingAiAction({ key: `finding-${idx}`, title: cleanCategory, category: cleanCategory, severity: item.severity, message: item.message })}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40 hover:bg-gov-blue dark:hover:bg-blue-700 text-gov-blue dark:text-blue-400 hover:text-white dark:hover:text-white text-[11px] font-medium transition-colors border border-blue-200 dark:border-blue-900/50 shadow-2xs"
                    title="Ask AI Assistant directly in chat without pop-up"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Assistant</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Harmonized BIS Specification Clause */}
      {completeSpecClause && (
        <div className="p-4 rounded-lg bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gov-navy dark:text-gray-200">
              <BookOpen className="w-4 h-4 text-gov-green dark:text-emerald-400" />
              <span>Harmonized Statutory Tender Clause</span>
            </div>
            <button onClick={handleCopy} className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-gov-offwhite dark:hover:bg-slate-700 text-gov-text dark:text-gray-200 text-[11px] transition-colors border border-gov-border dark:border-slate-700">
              {copied ? <><Check className="w-3 h-3 text-gov-green" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Clause</>}
            </button>
          </div>
          <pre className="text-[11px] text-gov-text dark:text-gray-200 whitespace-pre-wrap font-mono bg-gov-offwhite dark:bg-[#0c1421] p-3 rounded max-h-48 overflow-y-auto leading-relaxed border border-gov-border dark:border-slate-800">
            {completeSpecClause}
          </pre>
        </div>
      )}
    </div>
  );
};
