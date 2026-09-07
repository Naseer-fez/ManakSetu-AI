import React from "react";
import { Activity, ShieldCheck } from "lucide-react";

export const AudioStatusCard: React.FC = () => (
  <div className="pt-2 border-t border-white/10 space-y-2">
    <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
      Audio Subsystem Status
    </div>
    <div className="space-y-1.5 text-xs text-white/70">
      <div className="flex items-center justify-between bg-black/20 px-3 py-2 rounded-xl">
        <span className="flex items-center gap-1.5 text-white/60">
          <Activity className="w-3.5 h-3.5 text-apple-mint" />
          Neural TTS Engine
        </span>
        <span className="text-apple-mint font-medium">Ready</span>
      </div>
      <div className="flex items-center justify-between bg-black/20 px-3 py-2 rounded-xl">
        <span className="flex items-center gap-1.5 text-white/60">
          <ShieldCheck className="w-3.5 h-3.5 text-apple-blue" />
          Voice Activity Detector
        </span>
        <span className="text-white/80 font-medium">Active</span>
      </div>
    </div>
  </div>
);
