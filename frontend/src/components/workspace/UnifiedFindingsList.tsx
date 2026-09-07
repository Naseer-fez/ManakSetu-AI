import React, { useState } from "react";
import { AlertTriangle, BookOpen, Copy, Check, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { useRemembrance } from "../../context/RemembranceContext";

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
  const { setActiveIssueModal } = useRemembrance();
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
        <div className="flex items-center justify-between text-xs font-semibold text-white/80 px-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-apple-amber" />
            <span>Statutory Compliance Findings ({findings.length})</span>
          </div>
          <span className="text-[10px] text-white/40">Audit Verdicts</span>
        </div>

        <div className="space-y-2.5">
          {findings.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 space-y-2 transition-all hover:border-white/15">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white truncate">{item.category}</span>
                <span className={clsx("text-[10px] px-2 py-0.5 rounded-md font-bold uppercase", item.severity.toLowerCase() === "high" ? "bg-apple-red/20 text-apple-red" : "bg-apple-amber/20 text-apple-amber")}>
                  {item.severity} Severity
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{item.message}</p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setActiveIssueModal({
                    key: `finding-${idx}-${item.category}`,
                    title: item.category,
                    category: item.category,
                    severity: item.severity,
                    message: item.message,
                  })}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-apple-blue/15 hover:bg-apple-blue/25 text-apple-blue text-[11px] font-medium transition-colors border border-apple-blue/30"
                  title="Ask AI Assistant directly about this specific issue"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Assistant</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Harmonized BIS Specification Clause */}
      {completeSpecClause && (
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <BookOpen className="w-4 h-4 text-apple-mint" />
              <span>Harmonized Statutory Tender Clause</span>
            </div>
            <button onClick={handleCopy} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] transition-colors border border-white/10">
              {copied ? <><Check className="w-3 h-3 text-apple-mint" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Clause</>}
            </button>
          </div>
          <pre className="text-[11px] text-white/70 whitespace-pre-wrap font-mono bg-black/40 p-3 rounded-xl max-h-48 overflow-y-auto leading-relaxed border border-white/5">
            {completeSpecClause}
          </pre>
        </div>
      )}
    </div>
  );
};
