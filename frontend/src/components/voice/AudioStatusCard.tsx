import React from "react";
import { Activity, ShieldCheck } from "lucide-react";

export const AudioStatusCard: React.FC = () => (
  <div className="pt-2 border-t border-gov-border dark:border-slate-800 space-y-2">
    <div className="text-[11px] font-semibold text-gov-text-secondary dark:text-gray-400 uppercase tracking-wider">
      Audio Subsystem Status
    </div>
    <div className="space-y-1.5 text-xs text-gov-text dark:text-gray-200">
      <div className="flex items-center justify-between bg-gov-offwhite dark:bg-slate-800/60 px-3 py-2 rounded-lg border border-gov-border dark:border-slate-700">
        <span className="flex items-center gap-1.5 text-gov-text-secondary dark:text-gray-300">
          <Activity className="w-3.5 h-3.5 text-gov-green dark:text-emerald-400" />
          Neural TTS Engine
        </span>
        <span className="text-gov-green dark:text-emerald-400 font-semibold">Ready</span>
      </div>
      <div className="flex items-center justify-between bg-gov-offwhite dark:bg-slate-800/60 px-3 py-2 rounded-lg border border-gov-border dark:border-slate-700">
        <span className="flex items-center gap-1.5 text-gov-text-secondary dark:text-gray-300">
          <ShieldCheck className="w-3.5 h-3.5 text-gov-blue dark:text-blue-400" />
          Voice Activity Detector
        </span>
        <span className="text-gov-navy dark:text-white font-semibold">Active</span>
      </div>
    </div>
  </div>
);
