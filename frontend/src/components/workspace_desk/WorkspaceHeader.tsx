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
    empty: { label: "Draft Workspace", color: "bg-white/10 text-white/70" },
    uploaded: { label: "Document Staged", color: "bg-apple-blue/20 text-apple-blue border border-apple-blue/30" },
    auditing: { label: "Auditing...", color: "bg-apple-amber/20 text-apple-amber border border-apple-amber/30" },
    review: { label: "Review Desk Active", color: "bg-apple-mint/20 text-apple-mint border border-apple-mint/30" },
    error: { label: "Error", color: "bg-apple-red/20 text-apple-red border border-apple-red/30" },
  }[stage];

  return (
    <header className="shrink-0 flex items-center justify-between gap-4 pb-1">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 shrink-0">
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
              className="bg-black/60 border border-apple-blue rounded-lg px-2 py-0.5 text-sm font-semibold text-white focus:outline-none"
            />
            <button onClick={saveTitle} className="p-1 text-apple-mint hover:text-white" aria-label="Save title">
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
            <h2 className="text-sm font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">{title}</h2>
            <Edit3 className="w-3.5 h-3.5 text-white/30 group-hover:text-white/80 transition-colors" />
          </div>
        )}

        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageBadges.color}`}>
          {stageBadges.label}
        </span>
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/10 transition-colors"
        title="Start fresh workspace"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">New Workspace</span>
      </button>
    </header>
  );
};
