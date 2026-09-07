import React from "react";
import { useLiveVoice } from "./useLiveVoice";
import { LiveTranscript } from "./LiveTranscript";
import { MicVisualizer } from "./MicVisualizer";

const WS_URL = `${import.meta.env.VITE_WS_URL || (typeof window !== "undefined" ? (window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host : "ws://127.0.0.1:8000")}/api/v1/voice/live`;

export const VoiceLivePanel: React.FC = () => {
  const voice = useLiveVoice(WS_URL);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-4">
      <div className="apple-glass rounded-3xl border border-white/10 flex flex-col shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">🎙️ Live Voice Assistant</h2>
          <button onClick={voice.isConnected ? voice.disconnect : voice.connect}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              voice.isConnected ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
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
          <div className="text-red-400 text-sm mt-4 p-3 bg-red-900/20 rounded-lg border border-red-500/20">
            {voice.error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={voice.toggleListening} disabled={!voice.isConnected}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all shadow-md ${
              !voice.isConnected ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
              : voice.isListening ? "bg-red-600 hover:bg-red-500 text-white" 
              : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}>
            {voice.isListening ? "⏹ Stop Listening" : "🎤 Start Listening"}
          </button>
        </div>
      </div>
    </div>
  );
};
