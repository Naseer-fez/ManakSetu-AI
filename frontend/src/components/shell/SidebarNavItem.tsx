import React from "react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

export interface SidebarNavItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut: string;
  isActive: boolean;
  isCollapsed: boolean;
  hasDot?: boolean;
  onClick: () => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  label,
  icon: Icon,
  shortcut,
  isActive,
  isCollapsed,
  hasDot,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      title={`${label} (Press ${shortcut})`}
      className={clsx(
        "group relative flex items-center w-full rounded transition-all duration-150 text-left font-medium select-none",
        isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-3",
        isActive
          ? "bg-gov-blue text-white shadow-sm"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      )}
    >
      <div className="relative shrink-0 flex items-center justify-center">
        <Icon className={clsx("w-5 h-5 transition-transform", isActive && "scale-105")} />
        {hasDot && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gov-saffron ring-2 ring-gov-navy" />
        )}
      </div>

      {!isCollapsed && (
        <span className="truncate text-sm flex-1">{label}</span>
      )}
    </button>
  );
};

export default SidebarNavItem;
