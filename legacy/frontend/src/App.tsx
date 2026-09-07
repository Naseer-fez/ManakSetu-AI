import { useState, type FC } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { CommandRail } from '@/components/shell/CommandRail';
import { MobileDock } from '@/components/shell/MobileDock';
import { AssistantSheet } from '@/components/shell/AssistantSheet';
import { RupeeCursor } from '@/components/shell/RupeeCursor';
import { ActiveTabContent } from '@/components/shell/ActiveTabContent';
import { type TabId } from '@/components/shell/rail.types';

export const App: FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('workspace');
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [pdfText, setPdfText] = useState<string | null>(null);

  const handleSetPdfText = (text: string): void => {
    setPdfText(text);
  };

  const handleRefreshContext = (): void => {
    setPdfText(null);
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-ruby/20 selection:text-ruby">
      {/* Ruby Glass Rupee Cursor Follower */}
      <RupeeCursor />

      {/* Desktop Spatial Command Rail (60px fixed left) */}
      <CommandRail
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={() => setIsAssistantOpen((prev) => !prev)}
        theme={theme}
        onToggleTheme={toggleTheme}
        hasContext={Boolean(pdfText)}
      />

      {/* Mobile Bottom Dock (<768px) */}
      <MobileDock
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={() => setIsAssistantOpen((prev) => !prev)}
        theme={theme}
        onToggleTheme={toggleTheme}
        hasContext={Boolean(pdfText)}
      />

      {/* Editorial Content Canvas (offset by rail on desktop, dock on mobile) */}
      <main className="flex-1 pl-0 md:pl-[60px] pb-20 md:pb-6 p-6 sm:p-8 transition-colors duration-200">
        <ActiveTabContent
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onSetPdfText={handleSetPdfText}
          theme={theme}
        />
      </main>

      {/* Global Assistant Side Sheet (~380px drawer, non-blocking) */}
      <AssistantSheet
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        documentContext={pdfText}
        onRefreshContext={handleRefreshContext}
      />
    </div>
  );
};

export default App;
