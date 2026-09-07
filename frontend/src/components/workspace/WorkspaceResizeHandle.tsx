import React from "react";
import { GripVertical } from "lucide-react";

interface WorkspaceResizeHandleProps {
  onDragStart: (e: React.MouseEvent) => void;
  onSetRatio: (percent: number) => void;
  currentPercent: number;
}

export const WorkspaceResizeHandle: React.FC<WorkspaceResizeHandleProps> = ({
  onDragStart,
  onSetRatio,
  currentPercent,
}) => {
  return (
    <div
      onMouseDown={onDragStart}
      className="hidden lg:flex flex-col items-center justify-center w-3 h-full cursor-col-resize group hover:bg-apple-blue/20 transition-colors select-none relative z-20 shrink-0"
      title="Drag to resize sections or click preset"
    >
      <div className="w-1 h-12 rounded-full bg-white/20 group-hover:bg-apple-blue group-active:bg-apple-blue transition-colors flex items-center justify-center">
        <GripVertical className="w-3 h-3 text-white/40 group-hover:text-white" />
      </div>

      {/* Subtle preset tags on hover */}
      <div className="absolute top-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 pointer-events-auto bg-black/80 p-1 rounded-lg border border-white/10 shadow-xl text-[9px] font-mono font-bold text-white/70">
        <button
          onClick={e => { e.stopPropagation(); onSetRatio(60); }}
          className={`px-1.5 py-0.5 rounded hover:bg-apple-blue hover:text-white ${currentPercent === 60 ? "text-apple-blue font-bold" : ""}`}
        >
          60%
        </button>
        <button
          onClick={e => { e.stopPropagation(); onSetRatio(70); }}
          className={`px-1.5 py-0.5 rounded hover:bg-apple-blue hover:text-white ${currentPercent === 70 ? "text-apple-blue font-bold" : ""}`}
        >
          70%
        </button>
        <button
          onClick={e => { e.stopPropagation(); onSetRatio(50); }}
          className={`px-1.5 py-0.5 rounded hover:bg-apple-blue hover:text-white ${currentPercent === 50 ? "text-apple-blue font-bold" : ""}`}
        >
          50%
        </button>
      </div>
    </div>
  );
};
