import React, { useState } from "react";
import { VoiceAssistantView } from "./VoiceAssistantView";
import { VoiceLivePanel } from "./VoiceLivePanel";
import { SpeakToAiSidebar } from "./voice/SpeakToAiSidebar";
import { motion, AnimatePresence } from "framer-motion";

export const SpeakToAiView: React.FC = () => {
  const [voiceMode, setVoiceMode] = useState<"interactive" | "live">("interactive");

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <SpeakToAiSidebar voiceMode={voiceMode} setVoiceMode={setVoiceMode} />

      <main className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {voiceMode === "interactive" ? (
            <motion.div
              key="interactive"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <VoiceAssistantView />
            </motion.div>
          ) : (
            <motion.div
              key="live"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <VoiceLivePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
export default SpeakToAiView;
