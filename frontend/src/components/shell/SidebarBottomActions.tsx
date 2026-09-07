import React from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { clsx } from "clsx";

interface SidebarBottomActionsProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleAssistant?: () => void;
}

export const SidebarBottomActions: React.FC<SidebarBottomActionsProps> = ({
  isCollapsed,
  onToggleCollapse,
  onToggleAssistant,
}) => (
  <div className="p-2 border-t border-slate-700/60 dark:border-slate-800 space-y-1">
    {onToggleAssistant && (
      <button
        onClick={onToggleAssistant}
        title="Toggle BIS AI Copilot"
        className={clsx(
          "flex items-center w-full rounded p-2 text-xs font-medium text-gov-saffron hover:bg-white/10 transition-colors",
          isCollapsed ? "justify-center" : "gap-2"
        )}
      >
        <Sparkles className="w-4 h-4 shrink-0" />
        {!isCollapsed && <span>AI Copilot</span>}
      </button>
    )}

    <button
      onClick={onToggleCollapse}
      title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      className={clsx(
        "flex items-center w-full rounded p-2 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors",
        isCollapsed ? "justify-center" : "gap-2"
      )}
    >
      {isCollapsed ? <ChevronRight className="w-4 h-4 shrink-0" /> : <ChevronLeft className="w-4 h-4 shrink-0" />}
      {!isCollapsed && <span>Collapse</span>}
    </button>
  </div>
);

export default SidebarBottomActions;
