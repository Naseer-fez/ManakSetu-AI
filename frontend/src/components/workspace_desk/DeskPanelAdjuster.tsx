import React from "react";
import { GripVertical } from "lucide-react";

interface DeskPanelAdjusterProps {
  onDragStart: (e: React.MouseEvent) => void;
  onReset?: () => void;
  label?: string;
}

export const DeskPanelAdjuster: React.FC<DeskPanelAdjusterProps> = ({
  onDragStart,
  onReset,
  label = "Drag to resize sections",
}) => {
  return (
    <div
      onMouseDown={onDragStart}
      onDoubleClick={onReset}
      className="hidden lg:flex flex-col items-center justify-center w-2.5 h-full cursor-col-resize group hover:bg-gov-blue/20 dark:hover:bg-blue-500/20 transition-colors select-none relative z-20 shrink-0"
      title={`${label} (Double click to reset)`}
    >
      <div className="w-1 h-14 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-gov-blue dark:group-hover:bg-blue-400 group-active:bg-gov-blue transition-colors flex items-center justify-center">
        <GripVertical className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-white" />
      </div>
    </div>
  );
};

export default DeskPanelAdjuster;
