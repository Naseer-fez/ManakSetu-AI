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
      className="hidden lg:flex flex-col items-center justify-center w-3 h-full cursor-col-resize group hover:bg-gov-blue/20 dark:hover:bg-gov-blue/30 transition-colors select-none relative z-20 shrink-0"
      title="Drag to resize sections or click preset"
    >
      <div className="w-1 h-12 rounded-full bg-gray-300 dark:bg-slate-700 group-hover:bg-gov-blue group-active:bg-gov-blue transition-colors flex items-center justify-center">
        <GripVertical className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-white" />
      </div>

      {/* Subtle preset tags on hover */}
      <div className="absolute top-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 pointer-events-auto bg-white dark:bg-slate-900 p-1 rounded-lg border border-gray-200 dark:border-slate-800 shadow-xl text-[9px] font-mono font-bold text-gray-700 dark:text-gray-300">
        <button
          onClick={e => { e.stopPropagation(); onSetRatio(60); }}
          className={`px-1.5 py-0.5 rounded hover:bg-gov-blue hover:text-white ${currentPercent === 60 ? "text-gov-blue font-bold" : ""}`}
        >
          60%
        </button>
        <button
          onClick={e => { e.stopPropagation(); onSetRatio(70); }}
          className={`px-1.5 py-0.5 rounded hover:bg-gov-blue hover:text-white ${currentPercent === 70 ? "text-gov-blue font-bold" : ""}`}
        >
          70%
        </button>
        <button
          onClick={e => { e.stopPropagation(); onSetRatio(50); }}
          className={`px-1.5 py-0.5 rounded hover:bg-gov-blue hover:text-white ${currentPercent === 50 ? "text-gov-blue font-bold" : ""}`}
        >
          50%
        </button>
      </div>
    </div>
  );
};
