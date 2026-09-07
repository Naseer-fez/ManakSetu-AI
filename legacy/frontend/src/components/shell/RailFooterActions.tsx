import { useState, type FC } from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { ActionTooltip } from '@/components/shell/ActionTooltip';
import { cn } from '@/lib/utils';

export interface RailFooterActionsProps {
  isAssistantOpen: boolean;
  onToggleAssistant: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  hasContext?: boolean;
  isMobile?: boolean;
}

export const RailFooterActions: FC<RailFooterActionsProps> = ({
  isAssistantOpen,
  onToggleAssistant,
  theme,
  onToggleTheme,
  hasContext = false,
  isMobile = false,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className={cn('flex items-center gap-2', isMobile ? 'flex-row' : 'flex-col')}>
      {/* Assistant Toggle Button */}
      <div
        className="relative"
        onMouseEnter={() => setHovered('assistant')}
        onMouseLeave={() => setHovered(null)}
      >
        <button
          type="button"
          onClick={onToggleAssistant}
          aria-label="Toggle BIS Assistant"
          className={cn(
            'relative flex items-center justify-center rounded-xl transition-all cursor-pointer',
            isMobile ? 'w-10 h-10' : 'w-11 h-11',
            isAssistantOpen
              ? 'bg-ruby text-white shadow-glass shadow-ruby/30'
              : 'bg-panel hover:bg-subtle text-text-secondary hover:text-text-primary border border-border'
          )}
        >
          <Sparkles className="w-5 h-5 shrink-0" />
          {hasContext && (
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-warning ring-2 ring-surface animate-pulse"
              title="Active document context"
            />
          )}
        </button>
        {!isMobile && (
          <ActionTooltip
            isVisible={hovered === 'assistant'}
            title="Assistant"
            subtitle="AI Procurement Guidance"
          />
        )}
      </div>

      {/* Theme Toggle Button */}
      <div
        className="relative"
        onMouseEnter={() => setHovered('theme')}
        onMouseLeave={() => setHovered(null)}
      >
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={cn(
            'flex items-center justify-center rounded-xl bg-panel hover:bg-subtle text-text-secondary hover:text-text-primary border border-border transition-all cursor-pointer',
            isMobile ? 'w-10 h-10' : 'w-11 h-11'
          )}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-ruby" /> : <Moon className="w-5 h-5 text-ruby" />}
        </button>
        {!isMobile && (
          <ActionTooltip
            isVisible={hovered === 'theme'}
            title="Theme"
            subtitle={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          />
        )}
      </div>
    </div>
  );
};
