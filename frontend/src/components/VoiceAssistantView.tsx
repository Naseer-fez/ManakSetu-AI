import React, { useEffect, useRef, useState } from "react";
import { VoiceControlsToolbar } from "./VoiceControlsToolbar";
import { VoiceChatThread } from "./VoiceChatThread";
import { PushToTalkButton } from "./PushToTalkButton";
import { fetchVoiceStatus, sendVoiceChat } from "../services/voice.service";
import type { VoiceChatMessage, VoiceStatusResponse } from "../types";

export const VoiceAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"fast" | "thinking">("thinking");
  const [language, setLanguage] = useState<string>("auto");
  const [status, setStatus] = useState<VoiceStatusResponse | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchVoiceStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  const handleAudioReady = async (blob: Blob) => {
    setIsProcessing(true);
    const tempId = Date.now().toString();
    try {
      const resp = await sendVoiceChat(blob, messages, mode, language);
      const userMsg: VoiceChatMessage = {
        id: `user-${tempId}`,
        role: "user",
        content: resp.transcribed_text || "Spoken query",
        detectedLanguage: resp.detected_language,
        timestamp: new Date().toLocaleTimeString(),
      };
      const aiMsg: VoiceChatMessage = {
        id: `ai-${tempId}`,
        role: "assistant",
        content: resp.llm_response,
        audioUrl: resp.audio_url,
        detectedLanguage: resp.detected_language,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
      // Auto-play the audio response cleanly
      if (resp.audio_url) {
        if (activeAudioRef.current) {
          activeAudioRef.current.pause();
        }
        const audio = new Audio(resp.audio_url);
        activeAudioRef.current = audio;
        audio.play().catch(() => {});
        audio.onended = () => {
          if (activeAudioRef.current === audio) activeAudioRef.current = null;
        };
      }
    } catch {
      const errorMsg: VoiceChatMessage = {
        id: `err-${tempId}`,
        role: "assistant",
        content: "Sorry, I encountered an error processing your voice query. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-4">
      <VoiceControlsToolbar
        mode={mode}
        setMode={setMode}
        language={language}
        setLanguage={setLanguage}
        status={status}
        onClear={() => setMessages([])}
        hasMessages={messages.length > 0}
      />
      <div className="apple-glass rounded-3xl border border-white/10 flex flex-col shadow-2xl overflow-hidden">
        <VoiceChatThread messages={messages} isProcessing={isProcessing} />
        <div className="border-t border-white/10 bg-slate-900/40 p-2">
          <PushToTalkButton onAudioReady={handleAudioReady} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  );
};
