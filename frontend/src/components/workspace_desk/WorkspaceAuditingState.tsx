import React, { useEffect, useState } from "react";
import { Loader2, XCircle, ShieldCheck, CheckCircle2 } from "lucide-react";

interface WorkspaceAuditingStateProps {
  documentName: string;
  isReady?: boolean;
  onCancel: () => void;
  onComplete: () => void;
}

export const WorkspaceAuditingState: React.FC<WorkspaceAuditingStateProps> = ({
  documentName,
  isReady = false,
  onCancel,
  onComplete,
}) => {
  const [progress, setProgress] = useState(15);
  const [stepText, setStepText] = useState("Extracting document structure & technical clauses...");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (isReady) return 100;
        if (prev < 35) {
          setStepText("Extracting document structure & technical clauses...");
          return prev + 2;
        }
        if (prev < 65) {
          setStepText("Cross-referencing Bureau of Indian Standards & mandatory QCOs...");
          return prev + 1.5;
        }
        if (prev < 88) {
          setStepText("Synthesizing statutory compliance evaluation matrix...");
          return prev + 0.8;
        }
        setStepText("Finalizing audit intelligence with GPU compliance engine...");
        return prev;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isReady]);

  useEffect(() => {
    if (isReady && progress >= 95) {
      setStepText("Audit evaluation verified. Opening review desk...");
      const timer = setTimeout(() => {
        onComplete();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isReady, progress, onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-gov-blue dark:text-blue-400 mb-6 relative shadow-sm">
        {progress >= 100 ? (
          <CheckCircle2 className="w-8 h-8 text-gov-green dark:text-emerald-400 animate-in zoom-in-75 duration-200" />
        ) : (
          <>
            <ShieldCheck className="w-8 h-8" />
            <Loader2 className="w-10 h-10 absolute animate-spin text-gov-blue/40 dark:text-blue-400/40" />
          </>
        )}
      </div>

      <h3 className="text-base font-bold text-gov-navy dark:text-white mb-1.5">
        {progress >= 100 ? "Audit Completed Successfully" : "Executing Statutory Compliance Audit"}
      </h3>
      <p className="text-xs text-gov-text-secondary dark:text-gray-300 max-w-sm mb-6 leading-relaxed truncate">
        {documentName}
      </p>

      <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2.5 mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            progress >= 100 ? "bg-gov-green dark:bg-emerald-500" : "bg-gov-blue dark:bg-blue-500"
          }`}
          style={{ width: `${Math.min(100, Math.round(progress))}%` }}
        />
      </div>

      <p className="text-[11px] text-gov-text-secondary dark:text-gray-400 mb-6 font-mono min-h-4">
        {stepText}
      </p>

      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 rounded-xl bg-white hover:bg-gov-offwhite dark:bg-slate-800 dark:hover:bg-slate-700 text-gov-text dark:text-gray-200 hover:text-gov-navy dark:hover:text-white border border-gov-border dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
      >
        <XCircle className="w-3.5 h-3.5" />
        <span>Cancel Audit</span>
      </button>
    </div>
  );
};

export default WorkspaceAuditingState;
