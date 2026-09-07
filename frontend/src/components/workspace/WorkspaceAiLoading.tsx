import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface WorkspaceAiLoadingProps {
  fileName?: string;
}

export const WorkspaceAiLoading: React.FC<WorkspaceAiLoadingProps> = ({ fileName }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-apple-indigo/20 text-apple-indigo flex items-center justify-center shadow-lg shadow-apple-indigo/20">
          <Sparkles className="w-7 h-7 animate-pulse text-apple-indigo" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-white/10 text-apple-mint">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-sm font-bold text-white tracking-tight">Preparing document intelligence...</h4>
        <p className="text-xs text-white/50 max-w-xs leading-relaxed">
          Grounding semantic reasoning model with {fileName ? `“${fileName}”` : "the active tender document"}.
        </p>
      </div>

      <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-apple-indigo rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};
