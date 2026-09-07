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
      className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full apple-glass-dark border border-white/20 shadow-2xl hover:scale-105 active:scale-95 group transition-all text-white flex items-center gap-2"
      title="Open AI Audit Assistant"
    >
      <Sparkles className="w-5 h-5 text-apple-indigo group-hover:rotate-12 transition-transform" />
      <span className="text-xs font-semibold pr-1 hidden sm:inline">AI Assistant</span>
    </button>
  );
};
