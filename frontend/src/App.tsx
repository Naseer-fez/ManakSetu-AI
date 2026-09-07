import React, { useState } from "react";
import { TopInstitutionalHeader } from "@/components/shell/TopInstitutionalHeader";
import { LeftCommandSidebar } from "@/components/shell/LeftCommandSidebar";
import { RecommendationTab } from "@/components/recommend/RecommendationTab";
import { TenderRadarView } from "@/components/tender/TenderRadarView";
import { WorkspaceDeskView } from "@/components/workspace/WorkspaceDeskView";
import { AiChatView } from "@/components/chat/AiChatView";
import { SpeakToAiView } from "@/components/voice/SpeakToAiView";
import { KnowledgeGraphView } from "@/components/graph/KnowledgeGraphView";
import { QcoExplorerView } from "@/components/qco/QcoExplorerView";
import { GemSimulatorView } from "@/components/gem/GemSimulatorView";
import { AssistantChatDrawer } from "@/components/AssistantChatDrawer";
import { useRemembrance, RemembranceProvider } from "@/context/RemembranceContext";
import { ThemeProvider } from "@/context/ThemeContext";

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useRemembrance();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [, setPdfText] = useState<string>("");

  const hideFloatingAssistant = activeTab === "tender" || activeTab === "workspace" || activeTab === "chat";

  return (
    <div className="h-screen w-screen flex flex-col bg-gov-offwhite dark:bg-[#0a0f18] text-gov-text dark:text-gray-100 font-sans overflow-hidden transition-colors">
      <TopInstitutionalHeader />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <LeftCommandSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />

        <main className="flex-1 relative flex flex-col min-w-0 bg-gov-offwhite dark:bg-[#0a0f18] overflow-hidden">
          <div className={activeTab === "recommend" ? "h-full overflow-y-auto p-4 sm:p-6" : "hidden"}>
            <RecommendationTab />
          </div>
          <div className={activeTab === "tender" ? "h-full flex flex-col flex-1 min-h-0" : "hidden"}>
            <TenderRadarView />
          </div>
          <div className={activeTab === "workspace" ? "h-full flex flex-col flex-1 min-h-0 overflow-y-auto" : "hidden"}>
            <WorkspaceDeskView onNavigate={setActiveTab} onSetPdfText={setPdfText} />
          </div>
          <div className={activeTab === "chat" ? "h-full flex flex-col flex-1 min-h-0" : "hidden"}>
            <AiChatView />
          </div>
          <div className={activeTab === "speak_to_ai" ? "h-full overflow-y-auto p-4 sm:p-6" : "hidden"}>
            <SpeakToAiView />
          </div>
          <div className={activeTab === "graph" ? "h-full w-full" : "hidden"}>
            <KnowledgeGraphView />
          </div>
          <div className={activeTab === "qco" ? "h-full overflow-y-auto p-4 sm:p-6" : "hidden"}>
            <QcoExplorerView />
          </div>
          <div className={activeTab === "gem" ? "h-full overflow-y-auto p-4 sm:p-6" : "hidden"}>
            <GemSimulatorView />
          </div>
        </main>
      </div>

      {!hideFloatingAssistant && <AssistantChatDrawer />}
    </div>
  );
};

export const App: React.FC = () => (
  <ThemeProvider>
    <RemembranceProvider>
      <MainLayout />
    </RemembranceProvider>
  </ThemeProvider>
);

export default App;

