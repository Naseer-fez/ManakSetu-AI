import React from "react";
import { Sparkles } from "lucide-react";

interface WorkspaceFloatingAiButtonProps {
  onClick: () => void;
}

export const WorkspaceFloatingAiButton: React.FC<WorkspaceFloatingAiButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gov-navy hover:bg-slate-800 text-white border border-slate-700 shadow-xl hover:scale-105 active:scale-95 group transition-all flex items-center gap-2"
      title="Open AI Audit Assistant"
    >
      <Sparkles className="w-5 h-5 text-gov-saffron group-hover:rotate-12 transition-transform" />
      <span className="text-xs font-bold pr-1 hidden sm:inline">AI Copilot</span>
    </button>
  );
};
