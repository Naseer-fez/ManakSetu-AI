import React from "react";
import { Loader2, FileText, ShieldCheck } from "lucide-react";

interface WorkspaceLoadingViewProps {
  fileName?: string;
}

export const WorkspaceLoadingView: React.FC<WorkspaceLoadingViewProps> = ({ fileName }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
      {/* Left Card: Document Ingestion & Clause Extraction */}
      <div className="flex flex-col h-full min-h-0 apple-glass rounded-3xl border border-white/10 shadow-2xl p-6 items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-apple-blue/5 via-transparent to-transparent pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-apple-blue/20 border border-apple-blue/30 text-apple-blue flex items-center justify-center mb-4 shadow-lg shadow-apple-blue/10">
          <FileText className="w-7 h-7 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">Processing document</h3>
        <p className="text-xs text-white/50 mt-1 truncate max-w-xs">{fileName || "Parsing tender file..."}</p>

        <div className="flex items-center gap-2 my-5 text-apple-blue">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase text-white/70">Extracting clauses</span>
        </div>

        <div className="w-full max-w-sm space-y-2.5 pt-2">
          <div className="h-2.5 bg-white/10 rounded-full animate-pulse w-full" />
          <div className="h-2.5 bg-white/5 rounded-full animate-pulse w-4/5 mx-auto" />
          <div className="h-2.5 bg-white/10 rounded-full animate-pulse w-3/5 mx-auto" />
        </div>
      </div>

      {/* Right Card: Statutory BIS & QCO Audit Preparation */}
      <div className="flex flex-col h-full min-h-0 apple-glass rounded-3xl border border-white/10 shadow-2xl p-6 items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-apple-mint/5 via-transparent to-transparent pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-apple-mint/20 border border-apple-mint/30 text-apple-mint flex items-center justify-center mb-4 shadow-lg shadow-apple-mint/10">
          <ShieldCheck className="w-7 h-7 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">Preparing audit</h3>
        <p className="text-xs text-white/50 mt-1">Cross-referencing statutory Quality Control Orders</p>

        <div className="flex items-center gap-2 my-5 text-apple-mint">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase text-white/70">Evaluating compliance</span>
        </div>

        <div className="w-full max-w-sm grid grid-cols-3 gap-2 pt-2">
          <div className="h-16 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
          <div className="h-16 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
          <div className="h-16 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
