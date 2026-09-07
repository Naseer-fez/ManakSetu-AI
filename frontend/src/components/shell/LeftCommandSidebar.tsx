import React from "react";
import { clsx } from "clsx";
import { useRemembrance } from "@/context/RemembranceContext";
import { PRIMARY_TABS, GRAPH_TAB } from "@/components/shell/sidebar.types";
import { SidebarNavItem } from "@/components/shell/SidebarNavItem";
import { SidebarBottomActions } from "@/components/shell/SidebarBottomActions";

export interface LeftCommandSidebarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleAssistant?: () => void;
}

export const LeftCommandSidebar: React.FC<LeftCommandSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onToggleAssistant,
}) => {
  const { file, tabs, analysis } = useRemembrance();
  const hasTender = Boolean(file || tabs["tender"]?.file || analysis);

  const hasDataForTab = (id: string): boolean => {
    if (id === "tender" || id === "workspace") return Boolean(file || tabs[id]?.file);
    if (id === "qco" || id === "gem" || id === "graph") return Boolean(file || analysis);
    return false;
  };

  return (
    <aside
      className={clsx(
        "bg-gov-navy dark:bg-[#0c1626] text-white flex flex-col justify-between transition-all duration-200 select-none z-20 shrink-0 border-r border-slate-700 dark:border-slate-800",
        isCollapsed ? "w-16" : "w-[220px]"
      )}
    >
      <div className="p-2 space-y-1 overflow-y-auto">
        {PRIMARY_TABS.map((tab) => (
          <SidebarNavItem
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            shortcut={tab.shortcut}
            isActive={activeTab === tab.id}
            isCollapsed={isCollapsed}
            hasDot={hasDataForTab(tab.id)}
            onClick={() => onSelectTab(tab.id)}
          />
        ))}

        {hasTender && (
          <div className="pt-2 mt-2 border-t border-slate-700/60 dark:border-slate-800">
            {!isCollapsed && (
              <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-gov-saffron block mb-1">
                Tender Context
              </span>
            )}
            <SidebarNavItem
              id={GRAPH_TAB.id}
              label={GRAPH_TAB.label}
              icon={GRAPH_TAB.icon}
              shortcut={GRAPH_TAB.shortcut}
              isActive={activeTab === GRAPH_TAB.id}
              isCollapsed={isCollapsed}
              hasDot={true}
              onClick={() => onSelectTab(GRAPH_TAB.id)}
            />
          </div>
        )}
      </div>

      <SidebarBottomActions
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        onToggleAssistant={onToggleAssistant}
      />
    </aside>
  );
};

export default LeftCommandSidebar;
