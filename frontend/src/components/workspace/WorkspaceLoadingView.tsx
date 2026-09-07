import React from "react";
import { Loader2, FileText, ShieldCheck } from "lucide-react";

interface WorkspaceLoadingViewProps {
  fileName?: string;
}

export const WorkspaceLoadingView: React.FC<WorkspaceLoadingViewProps> = ({ fileName }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
      {/* Left Card: Document Ingestion & Clause Extraction */}
      <div className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-sm p-6 items-center justify-center text-center relative overflow-hidden">
        <div className="w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-gov-blue dark:text-blue-400 flex items-center justify-center mb-4 shadow-sm">
          <FileText className="w-7 h-7 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-gov-navy dark:text-white tracking-tight">Processing document</h3>
        <p className="text-xs text-gov-text-secondary dark:text-gray-400 mt-1 truncate max-w-xs">{fileName || "Parsing tender file..."}</p>

        <div className="flex items-center gap-2 my-5 text-gov-blue dark:text-blue-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase text-gov-navy dark:text-gray-200">Extracting clauses</span>
        </div>

        <div className="w-full max-w-sm space-y-2.5 pt-2">
          <div className="h-2.5 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse w-full" />
          <div className="h-2.5 bg-gray-100 dark:bg-slate-800/60 rounded-full animate-pulse w-4/5 mx-auto" />
          <div className="h-2.5 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse w-3/5 mx-auto" />
        </div>
      </div>

      {/* Right Card: Statutory BIS & QCO Audit Preparation */}
      <div className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-sm p-6 items-center justify-center text-center relative overflow-hidden">
        <div className="w-14 h-14 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-gov-green dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
          <ShieldCheck className="w-7 h-7 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-gov-navy dark:text-white tracking-tight">Preparing audit</h3>
        <p className="text-xs text-gov-text-secondary dark:text-gray-400 mt-1">Cross-referencing statutory Quality Control Orders</p>

        <div className="flex items-center gap-2 my-5 text-gov-green dark:text-emerald-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase text-gov-navy dark:text-gray-200">Evaluating compliance</span>
        </div>

        <div className="w-full max-w-sm grid grid-cols-3 gap-2 pt-2">
          <div className="h-16 rounded-lg bg-gray-100 dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 animate-pulse" />
          <div className="h-16 rounded-lg bg-gray-100 dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 animate-pulse" />
          <div className="h-16 rounded-lg bg-gray-100 dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
