import React from "react";
import { Info, X } from "lucide-react";

interface ExportNoticeToastProps {
  actionName: string;
  onDismiss: () => void;
}

export const ExportNoticeToast: React.FC<ExportNoticeToastProps> = ({ actionName, onDismiss }) => {
  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-black/90 border border-white/20 p-3.5 shadow-2xl backdrop-blur-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="w-5 h-5 rounded-full bg-apple-blue/20 text-apple-blue flex items-center justify-center shrink-0 mt-0.5">
        <Info className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0 text-xs">
        <p className="font-semibold text-white">UI Prototype: {actionName}</p>
        <p className="text-white/60 text-[11px] mt-0.5 leading-relaxed">
          Export pipeline will activate when the document generation backend services are connected.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-white/40 hover:text-white/90 transition-colors p-1"
        aria-label="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
