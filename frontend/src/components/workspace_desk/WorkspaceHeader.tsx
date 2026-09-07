import React, { useState } from "react";
import { Edit3, Check, RotateCcw, Shield } from "lucide-react";
import type { WorkspaceStage } from "@/components/workspace_desk/types";

interface WorkspaceHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  stage: WorkspaceStage;
  onReset: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  title,
  onTitleChange,
  stage,
  onReset,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  const saveTitle = () => {
    setIsEditing(false);
    if (draftTitle.trim()) {
      onTitleChange(draftTitle.trim());
    } else {
      setDraftTitle(title);
    }
  };

  const stageBadges = {
    empty: { label: "Draft Workspace", color: "bg-gray-100 dark:bg-slate-800 text-gov-text-secondary dark:text-gray-300 border border-gov-border dark:border-slate-700" },
    uploaded: { label: "Document Staged", color: "bg-blue-50 dark:bg-blue-950/40 text-gov-blue dark:text-blue-400 border border-blue-200 dark:border-blue-900/50" },
    auditing: { label: "Auditing...", color: "bg-amber-50 dark:bg-amber-950/40 text-gov-amber dark:text-amber-400 border border-amber-200 dark:border-amber-900/50" },
    review: { label: "Review Desk Active", color: "bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" },
    error: { label: "Error", color: "bg-red-50 dark:bg-red-950/40 text-gov-red dark:text-rose-400 border border-red-200 dark:border-red-900/50" },
  }[stage];

  return (
    <header className="shrink-0 flex items-center justify-between gap-4 pb-1">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-gov-border dark:border-slate-700 flex items-center justify-center text-gov-navy dark:text-white shrink-0 shadow-sm">
          <Shield className="w-4 h-4" />
        </div>

        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); }}
              autoFocus
              className="bg-white dark:bg-slate-900 border border-gov-blue dark:border-blue-500 rounded-lg px-2 py-0.5 text-sm font-semibold text-gov-text dark:text-white focus:outline-none"
            />
            <button onClick={saveTitle} className="p-1 text-gov-green dark:text-emerald-400 hover:text-gov-navy dark:hover:text-white" aria-label="Save title">
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
            <h2 className="text-sm font-bold text-gov-navy dark:text-white tracking-tight truncate max-w-xs sm:max-w-md">{title}</h2>
            <Edit3 className="w-3.5 h-3.5 text-gov-text-secondary/60 dark:text-white/40 group-hover:text-gov-navy dark:group-hover:text-white transition-colors" />
          </div>
        )}

        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${stageBadges.color}`}>
          {stageBadges.label}
        </span>
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gov-offwhite dark:bg-slate-800 dark:hover:bg-slate-700 text-gov-text dark:text-gray-200 hover:text-gov-navy dark:hover:text-white text-xs font-medium border border-gov-border dark:border-slate-700 transition-colors shadow-sm"
        title="Start fresh workspace"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">New Workspace</span>
      </button>
    </header>
  );
};
