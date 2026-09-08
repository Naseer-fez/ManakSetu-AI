import React, { useState } from "react";
import { TopInstitutionalHeader } from "@/components/shell/TopInstitutionalHeader";
import { LeftCommandSidebar } from "@/components/shell/LeftCommandSidebar";
import { TabContentContainer } from "@/components/shell/TabContentContainer";
import { AssistantChatDrawer } from "@/components/AssistantChatDrawer";
import { useRemembrance, RemembranceProvider } from "@/context/RemembranceContext";
import { ThemeProvider } from "@/context/ThemeContext";

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useRemembrance();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [pdfText, setPdfText] = useState<string>("");

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
          <TabContentContainer
            activeTab={activeTab}
            onNavigate={setActiveTab}
            onSetPdfText={setPdfText}
          />
        </main>
      </div>

      {!hideFloatingAssistant && <AssistantChatDrawer pdfText={pdfText} />}
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

