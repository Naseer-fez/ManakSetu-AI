import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface WorkspaceAiLoadingProps {
  fileName?: string;
}

export const WorkspaceAiLoading: React.FC<WorkspaceAiLoadingProps> = ({ fileName }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50 shadow-lg shadow-indigo-500/10">
          <Sparkles className="w-7 h-7 animate-pulse text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gov-green dark:text-emerald-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-sm font-bold text-gov-navy dark:text-white tracking-tight">Preparing document intelligence...</h4>
        <p className="text-xs text-gov-text-secondary dark:text-gray-400 max-w-xs leading-relaxed">
          Grounding semantic reasoning model with {fileName ? `“${fileName}”` : "the active tender document"}.
        </p>
      </div>

      <div className="w-32 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};
