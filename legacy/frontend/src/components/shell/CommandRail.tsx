import { type FC } from 'react';
import { Shield } from 'lucide-react';
import { RAIL_TABS, type TabId } from '@/components/shell/rail.types';
import { RailItem } from '@/components/shell/RailItem';
import { RailFooterActions } from '@/components/shell/RailFooterActions';
import { cn } from '@/lib/utils';

export interface CommandRailProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isAssistantOpen: boolean;
  onToggleAssistant: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  hasContext?: boolean;
  className?: string;
}

export const CommandRail: FC<CommandRailProps> = ({
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
      aria-label="Command Rail Navigation"
      aria-orientation="vertical"
      className={cn(
        'hidden md:flex fixed top-0 left-0 bottom-0 z-40 w-[60px] flex-col items-center justify-between py-4 select-none',
        'bg-surface/90 backdrop-blur-md border-r border-border shadow-glass',
        className
      )}
    >
      {/* Brand Anchor */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-10 h-10 rounded-xl bg-ruby/10 border border-ruby/30 flex items-center justify-center text-ruby shadow-glass shadow-ruby/20"
          title="BIS-SpecAI Procurement Platform"
        >
          <Shield className="w-5 h-5" />
        </div>
      </div>

      {/* The 9 Primary Navigation Tabs */}
      <div className="flex flex-col items-center gap-1.5 w-full px-1">
        {RAIL_TABS.map((item) => (
          <RailItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onSelect={() => onSelectTab(item.id)}
          />
        ))}
      </div>

      {/* Bottom Pinned Controls: Assistant & Theme */}
      <RailFooterActions
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={onToggleAssistant}
        theme={theme}
        onToggleTheme={onToggleTheme}
        hasContext={hasContext}
      />
    </nav>
  );
};
