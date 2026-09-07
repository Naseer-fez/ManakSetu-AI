import React from "react";
import { Mic, Loader2 } from "lucide-react";

interface MicVisualizerProps {
  isListening: boolean;
  isProcessing: boolean;
}

export const MicVisualizer: React.FC<MicVisualizerProps> = ({ isListening, isProcessing }) => {
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      {isListening && !isProcessing && (
        <>
          <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-green-500/30 animate-pulse" />
        </>
      )}
      {isProcessing && (
        <>
          <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-blue-500/30 animate-pulse" />
        </>
      )}
      <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
        isProcessing ? "bg-blue-600 text-white" :
        isListening ? "bg-green-600 text-white" :
        "bg-slate-800 text-slate-400 border border-white/10"
      }`}>
        {isProcessing ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </div>
    </div>
  );
};
