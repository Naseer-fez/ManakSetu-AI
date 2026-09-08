import React from "react";
import { Sparkles } from "lucide-react";

interface WorkspaceDeskAiBarProps {
  onClick: () => void;
  unreadCount?: number;
}

export const WorkspaceDeskAiBar: React.FC<WorkspaceDeskAiBarProps> = ({
  onClick,
  unreadCount = 0,
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-16 right-6 z-40 px-4 py-2.5 rounded-full bg-gov-navy hover:bg-slate-800 text-white border border-slate-700 shadow-2xl hover:scale-105 active:scale-95 group transition-all flex items-center gap-2.5 cursor-pointer"
      title="Open Review Copilot AI"
      aria-label="Open Review Copilot AI"
    >
      <div className="relative">
        <Sparkles className="w-4 h-4 text-gov-saffron group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-[9px] font-bold flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </div>
      <span className="text-xs font-bold tracking-wide">Review Copilot</span>
    </button>
  );
};

export default WorkspaceDeskAiBar;
