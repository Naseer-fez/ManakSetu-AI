import { type FC } from 'react';
import { type TabId } from '@/components/shell/rail.types';
import { WorkspacePage } from '@/components/workspace/WorkspacePage';
import { StandardsPage } from '@/components/standards/StandardsPage';
import { AuditorPage } from '@/components/auditor/AuditorPage';
import { QcoExplorerPage } from '@/components/qco/QcoExplorerPage';
import { KnowledgeGraphPage } from '@/components/graph/KnowledgeGraphPage';
import { GemSimulatorPage } from '@/components/gem/GemSimulatorPage';
import { VoiceAssistantPage } from '@/components/voice/VoiceAssistantPage';
import { LiveVoicePage } from '@/components/voice/LiveVoicePage';
import { ChatPage } from '@/components/chat/ChatPage';

export interface ActiveTabContentProps {
  activeTab: TabId;
  onNavigate: (tab: TabId) => void;
  onSetPdfText?: (text: string) => void;
  theme: 'dark' | 'light';
}

const PAGE_MAP: Record<TabId, FC<{ onNavigate: (t: string) => void; onSetPdfText?: (t: string) => void }>> = {
  workspace: ({ onNavigate, onSetPdfText }) => (
    <WorkspacePage onNavigate={onNavigate} onSetPdfText={onSetPdfText ?? (() => {})} />
  ),
  standards: () => <StandardsPage />,
  auditor: ({ onNavigate, onSetPdfText }) => (
    <AuditorPage onNavigate={onNavigate} onSetPdfText={onSetPdfText ?? (() => {})} />
  ),
  qco_explorer: () => <QcoExplorerPage />,
  knowledge_graph: () => <KnowledgeGraphPage />,
  gem_simulator: () => <GemSimulatorPage />,
  voice_assistant: () => <VoiceAssistantPage />,
  live_voice: () => <LiveVoicePage />,
  chat: () => <ChatPage />,
};

export const ActiveTabContent: FC<ActiveTabContentProps> = ({ activeTab, onNavigate, onSetPdfText }) => {
  const PageComponent = PAGE_MAP[activeTab];
  if (!PageComponent) return null;
  const handleNavigate = (t: string): void => onNavigate(t as TabId);
  return <PageComponent onNavigate={handleNavigate} onSetPdfText={onSetPdfText} />;
};
