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
      <div className="w-16 h-16 rounded-3xl bg-apple-blue/15 border border-apple-blue/30 flex items-center justify-center text-apple-blue mb-6 relative">
        <ShieldCheck className="w-8 h-8" />
        <Loader2 className="w-10 h-10 absolute animate-spin text-apple-blue/40" />
      </div>

      <h3 className="text-base font-semibold text-white mb-1.5">Preparing Document for Review</h3>
      <p className="text-xs text-slate-300 max-w-sm mb-6 leading-relaxed">
        {documentName}: Your document is being formatted for the compliance desk. (UI simulation mode)
      </p>

      {/* Animated Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="bg-apple-blue h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[11px] text-white/50 mb-6 font-mono">{stepText}</p>

      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
      >
        <XCircle className="w-3.5 h-3.5" />
        <span>Cancel Audit</span>
      </button>
    </div>
  );
};
