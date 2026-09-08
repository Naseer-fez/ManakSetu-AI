import React, { Suspense, lazy, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { RecommendationTab } from "@/components/recommend/RecommendationTab";

const TenderRadarView = lazy(() => import("@/components/tender/TenderRadarView"));
const WorkspaceDeskView = lazy(() => import("@/components/workspace/WorkspaceDeskView"));
const AiChatView = lazy(() => import("@/components/chat/AiChatView"));
const SpeakToAiView = lazy(() => import("@/components/voice/SpeakToAiView"));
const KnowledgeGraphView = lazy(() => import("@/components/graph/KnowledgeGraphView"));
const QcoExplorerView = lazy(() => import("@/components/qco/QcoExplorerView"));
const GemSimulatorView = lazy(() => import("@/components/gem/GemSimulatorView"));

const TabFallback: React.FC = () => (
  <div className="h-full w-full flex flex-col items-center justify-center p-8 gap-3 text-gov-text-secondary dark:text-gray-400 animate-fade-in">
    <Loader2 className="w-7 h-7 text-gov-blue dark:text-blue-400 animate-spin" />
    <span className="text-xs font-medium tracking-wide">Loading module...</span>
  </div>
);

export interface TabContentContainerProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onSetPdfText: (text: string) => void;
}

export const TabContentContainer: React.FC<TabContentContainerProps> = ({
  activeTab,
  onNavigate,
  onSetPdfText,
}) => {
  const [visited, setVisited] = useState<Set<string>>(() => new Set([activeTab]));

  useEffect(() => {
    setVisited((prev) => (prev.has(activeTab) ? prev : new Set(prev).add(activeTab)));
  }, [activeTab]);

  return (
    <Suspense fallback={<TabFallback />}>
      <div className={activeTab === "recommend" ? "h-full overflow-y-auto p-4 sm:p-6" : "hidden"}>
        <RecommendationTab />
      </div>
      {visited.has("tender") && (
        <div className={activeTab === "tender" ? "h-full flex flex-col flex-1 min-h-0" : "hidden"}>
          <TenderRadarView />
        </div>
      )}
      {visited.has("workspace") && (
        <div className={activeTab === "workspace" ? "h-full flex flex-col flex-1 min-h-0 overflow-y-auto" : "hidden"}>
          <WorkspaceDeskView onNavigate={onNavigate} onSetPdfText={onSetPdfText} />
        </div>
      )}
      {visited.has("chat") && (
        <div className={activeTab === "chat" ? "h-full flex flex-col flex-1 min-h-0" : "hidden"}>
          <AiChatView />
        </div>
      )}
      {visited.has("speak_to_ai") && (
        <div className={activeTab === "speak_to_ai" ? "h-full overflow-y-auto p-4 sm:p-6" : "hidden"}>
          <SpeakToAiView />
        </div>
      )}
      {visited.has("graph") && (
        <div className={activeTab === "graph" ? "h-full w-full" : "hidden"}>
          <KnowledgeGraphView />
        </div>
      )}
      {visited.has("qco") && (
        <div className={activeTab === "qco" ? "h-full overflow-y-auto p-4 sm:p-6" : "hidden"}>
          <QcoExplorerView />
        </div>
      )}
      {visited.has("gem") && (
        <div className={activeTab === "gem" ? "h-full overflow-y-auto p-4 sm:p-6" : "hidden"}>
          <GemSimulatorView />
        </div>
      )}
    </Suspense>
  );
};

export default TabContentContainer;
