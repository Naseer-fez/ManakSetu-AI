import React, { useState } from "react";
import { VoiceAssistantView } from "@/components/VoiceAssistantView";
import { VoiceLivePanel } from "@/components/VoiceLivePanel";
import { SpeakToAiSidebar } from "@/components/voice/SpeakToAiSidebar";

export const SpeakToAiView: React.FC = () => {
  const [voiceMode, setVoiceMode] = useState<"interactive" | "live">("interactive");

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <SpeakToAiSidebar voiceMode={voiceMode} setVoiceMode={setVoiceMode} />

      <main className="lg:col-span-8 bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg p-6 shadow-sm">
        {voiceMode === "interactive" ? (
          <VoiceAssistantView />
        ) : (
          <VoiceLivePanel />
        )}
      </main>
    </div>
  );
};

export default SpeakToAiView;
