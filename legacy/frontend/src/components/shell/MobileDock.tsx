import { type FC } from 'react';
import { RAIL_TABS, type TabId } from '@/components/shell/rail.types';
import { RailItem } from '@/components/shell/RailItem';
import { RailFooterActions } from '@/components/shell/RailFooterActions';
import { cn } from '@/lib/utils';

export interface MobileDockProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isAssistantOpen: boolean;
  onToggleAssistant: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  hasContext?: boolean;
  className?: string;
}

export const MobileDock: FC<MobileDockProps> = ({
  activeTab,
  onSelectTab,
  isAssistantOpen,
  onToggleAssistant,
  theme,
  onToggleTheme,
  hasContext = false,
  className,
}) => {
  return (
    <nav
      role="tablist"
      aria-label="Mobile Navigation Dock"
      className={cn(
        'md:hidden fixed bottom-3 inset-x-2 z-40 h-14 flex items-center justify-between px-2 gap-1 select-none',
        'bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-glass overflow-x-auto no-scrollbar',
        className
      )}
    >
      <div className="flex items-center gap-1 shrink-0">
        {RAIL_TABS.map((item) => (
          <RailItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onSelect={() => onSelectTab(item.id)}
            isMobile
          />
        ))}
      </div>

      <div className="h-6 w-px bg-border shrink-0 mx-1" />

      <div className="shrink-0">
        <RailFooterActions
          isAssistantOpen={isAssistantOpen}
          onToggleAssistant={onToggleAssistant}
          theme={theme}
          onToggleTheme={onToggleTheme}
          hasContext={hasContext}
          isMobile
        />
      </div>
    </nav>
  );
};
