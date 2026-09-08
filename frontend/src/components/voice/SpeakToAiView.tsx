import React, { useState, Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { VoiceAssistantView } from "@/components/VoiceAssistantView";
import { SpeakToAiSidebar } from "@/components/voice/SpeakToAiSidebar";

const VoiceLivePanel = lazy(() =>
  import("@/components/VoiceLivePanel").then((m) => ({ default: m.VoiceLivePanel }))
);

export const SpeakToAiView: React.FC = () => {
  const [voiceMode, setVoiceMode] = useState<"interactive" | "live">("interactive");

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <SpeakToAiSidebar voiceMode={voiceMode} setVoiceMode={setVoiceMode} />

      <main className="lg:col-span-8 bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg p-6 shadow-sm">
        {voiceMode === "interactive" ? (
          <VoiceAssistantView />
        ) : (
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center p-12 gap-3 text-gov-text-secondary dark:text-gray-400">
                <Loader2 className="w-7 h-7 text-gov-blue dark:text-blue-400 animate-spin" />
                <span className="text-xs font-medium">Initializing live streaming engine...</span>
              </div>
            }
          >
            <VoiceLivePanel />
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default SpeakToAiView;
