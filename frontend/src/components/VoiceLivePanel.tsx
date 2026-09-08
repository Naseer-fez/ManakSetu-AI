import React from "react";
import { useLiveVoice } from "@/components/useLiveVoice";
import { LiveTranscript } from "@/components/LiveTranscript";
import { MicVisualizer } from "@/components/MicVisualizer";

function getVoiceLiveWsUrl(): string {
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs && typeof envWs === "string" && envWs.trim()) {
    const raw = envWs.trim();
    if (raw.endsWith("/api/v1/voice/live")) return raw;
    return `${raw.replace(/\/+$/, "")}/api/v1/voice/live`;
  }
  const envApi = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (envApi && typeof envApi === "string" && envApi.trim() && /^https?:\/\//i.test(envApi.trim())) {
    const wsProto = envApi.trim().startsWith("https://") ? "wss://" : "ws://";
    const withoutProto = envApi.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    if (withoutProto.endsWith("/api/v1")) return `${wsProto}${withoutProto}/voice/live`;
    return `${wsProto}${withoutProto}/api/v1/voice/live`;
  }
  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss://" : "ws://";
    return `${proto}${window.location.host}/api/v1/voice/live`;
  }
  return "ws://127.0.0.1:8000/api/v1/voice/live";
}

export const VoiceLivePanel: React.FC = () => {
  const [language, setLanguage] = React.useState<string>("auto");
  const wsUrl = React.useMemo(() => getVoiceLiveWsUrl(), []);
  const voice = useLiveVoice(wsUrl, language);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-4">
      <div className="bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 flex flex-col shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-gov-navy dark:text-white">🎙️ Live Voice Assistant</h2>
            <div className="flex items-center gap-1 bg-gov-offwhite dark:bg-slate-800 p-0.5 rounded border border-gov-border dark:border-slate-700">
              {(["auto", "en", "hi"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    language === lang ? "bg-gov-blue text-white shadow-sm" : "text-gov-text-secondary dark:text-gray-400"
                  }`}
                >
                  {lang === "auto" ? "Auto" : lang === "en" ? "EN" : "हिन्दी"}
                </button>
              ))}
            </div>
          </div>
          <button onClick={voice.isConnected ? voice.disconnect : voice.connect}
            className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-colors ${
              voice.isConnected ? "bg-red-50 dark:bg-red-950/40 text-gov-red border border-red-200 dark:border-red-900" : "bg-blue-50 dark:bg-blue-950/40 text-gov-blue border border-blue-200 dark:border-blue-900"
            }`}>
            {voice.isConnected ? "Disconnect" : "Connect"}
          </button>
        </div>
        
        <div className="flex flex-col items-center py-6">
          <MicVisualizer isListening={voice.isListening} isProcessing={voice.isProcessing} />
        </div>
        
        <LiveTranscript
          turns={voice.turns}
          currentTranscript={voice.currentTranscript}
          currentResponse={voice.currentResponse}
          isProcessing={voice.isProcessing}
        />

        {voice.error && (
          <div className="text-gov-red dark:text-red-400 text-xs mt-4 p-3 bg-red-50 dark:bg-red-950/40 rounded border border-red-200 dark:border-red-900">
            {voice.error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={voice.toggleListening} disabled={!voice.isConnected}
            className={`flex-1 px-4 py-2.5 rounded font-semibold text-xs transition-all shadow-sm ${
              !voice.isConnected ? "bg-gray-100 dark:bg-slate-800 text-gov-text-secondary dark:text-gray-500 cursor-not-allowed border border-gov-border dark:border-slate-700" 
              : voice.isListening ? "bg-gov-red hover:bg-red-700 text-white" 
              : "bg-gov-blue hover:bg-blue-700 text-white"
            }`}>
            {voice.isListening ? "⏹ Stop Listening" : "🎤 Start Listening"}
          </button>
        </div>
      </div>
    </div>
  );
};
