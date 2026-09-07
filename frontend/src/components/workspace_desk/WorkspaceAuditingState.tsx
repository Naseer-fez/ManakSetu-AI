import React, { useEffect, useState } from "react";
import { Loader2, XCircle, ShieldCheck } from "lucide-react";

interface WorkspaceAuditingStateProps {
  documentName: string;
  onCancel: () => void;
  onComplete: () => void;
}

export const WorkspaceAuditingState: React.FC<WorkspaceAuditingStateProps> = ({
  documentName,
  onCancel,
  onComplete,
}) => {
  const [progress, setProgress] = useState(15);
  const [stepText, setStepText] = useState("Reading document structure & clauses...");

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setStepText("Identifying cited standards & quality orders...");
    }, 700);

    const t2 = setTimeout(() => {
      setProgress(80);
      setStepText("Synthesizing compliance evaluation matrix...");
    }, 1400);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStepText("Audit preparation complete. Opening review desk...");
    }, 2100);

    const t4 = setTimeout(() => {
      onComplete();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-gov-blue dark:text-blue-400 mb-6 relative shadow-sm">
        <ShieldCheck className="w-8 h-8" />
        <Loader2 className="w-10 h-10 absolute animate-spin text-gov-blue/40 dark:text-blue-400/40" />
      </div>

      <h3 className="text-base font-bold text-gov-navy dark:text-white mb-1.5">Preparing Document for Review</h3>
      <p className="text-xs text-gov-text-secondary dark:text-gray-300 max-w-sm mb-6 leading-relaxed">
        {documentName}: Your document is being formatted for the compliance desk.
      </p>

      {/* Animated Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="bg-gov-blue dark:bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[11px] text-gov-text-secondary dark:text-gray-400 mb-6 font-mono">{stepText}</p>

      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-xl bg-white hover:bg-gov-offwhite dark:bg-slate-800 dark:hover:bg-slate-700 text-gov-text dark:text-gray-200 hover:text-gov-navy dark:hover:text-white border border-gov-border dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
      >
        <XCircle className="w-3.5 h-3.5" />
        <span>Cancel Audit</span>
      </button>
    </div>
  );
};
