import React from "react";
import { FolderOpen, Plus } from "lucide-react";

interface WorkspaceToolbarProps {
  workspaceId: string;
  onNewSession: () => void;
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  workspaceId,
  onNewSession,
  title = "Tender Workspace",
  icon: Icon = FolderOpen,
}) => {
  return (
    <header className="flex items-center justify-between px-1 shrink-0 gap-3">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-apple-blue" />
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        {workspaceId && (
          <span className="text-[11px] px-2.5 py-0.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-mono">
            ID: {workspaceId.slice(0, 8)}
          </span>
        )}
      </div>
      <button
        onClick={onNewSession}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/10"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>New Session</span>
      </button>
    </header>
  );
};
