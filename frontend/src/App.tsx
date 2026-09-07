import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { RecommendationTab } from "./components/RecommendationTab";
import { ChatView } from "./components/ChatView";
import { SpeakToAiView } from "./components/SpeakToAiView";
import { KnowledgeGraphView } from "./components/KnowledgeGraphView";
import { QcoExplorerView } from "./components/QcoExplorerView";
import { GemSimulatorView } from "./components/GemSimulatorView";
import { AssistantChatDrawer } from "./components/AssistantChatDrawer";
import { WorkspaceView } from "./components/WorkspaceView";
import { TenderAnalyzerView } from "./components/TenderAnalyzerView";
import { RemembranceProvider } from "./context/RemembranceContext";

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("recommend");
  const isTender = activeTab === "tender" || activeTab === "radar";
  const isWorkspace = activeTab === "workspace";
  const isDocStation = isTender || isWorkspace;

  return (
    <div
      className={`${
        isDocStation || activeTab === "chat" || activeTab === "graph" ? "h-screen overflow-hidden" : "min-h-screen"
      } bg-apple-bg text-slate-100 flex flex-col font-sans selection:bg-apple-blue selection:text-white`}
    >
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main
        className={`flex-1 w-full mx-auto relative ${
          activeTab === "graph"
            ? "max-w-none p-0 pt-20 h-screen overflow-hidden"
            : isDocStation
            ? "max-w-none w-full px-4 sm:px-6 pt-20 pb-3 h-screen flex flex-col overflow-hidden min-h-0"
            : activeTab === "chat"
            ? "max-w-6xl w-full px-4 sm:px-6 pt-20 pb-4 h-screen flex flex-col overflow-hidden min-h-0"
            : "max-w-7xl p-6 space-y-6 pt-24"
        }`}
      >
        <div className={activeTab === "recommend" ? "block" : "hidden"}><RecommendationTab /></div>
        <div className={isTender ? "h-full w-full flex flex-col flex-1 min-h-0" : "hidden"}><TenderAnalyzerView /></div>
        <div className={isWorkspace ? "h-full w-full flex flex-col flex-1 min-h-0" : "hidden"}><WorkspaceView viewMode="pdf" /></div>
        <div className={activeTab === "chat" ? "h-full w-full flex flex-col flex-1 min-h-0" : "hidden"}><ChatView /></div>
        <div className={activeTab === "speak_to_ai" ? "block" : "hidden"}><SpeakToAiView /></div>
        <div className={activeTab === "graph" ? "h-full w-full" : "hidden"}><KnowledgeGraphView /></div>
        <div className={activeTab === "qco" ? "block" : "hidden"}><QcoExplorerView /></div>
        <div className={activeTab === "gem" ? "block" : "hidden"}><GemSimulatorView /></div>
      </main>

      {!isDocStation && activeTab !== "chat" && <AssistantChatDrawer />}
    </div>
  );
};

export const App: React.FC = () => (
  <RemembranceProvider>
    <MainContent />
  </RemembranceProvider>
);

export default App;
