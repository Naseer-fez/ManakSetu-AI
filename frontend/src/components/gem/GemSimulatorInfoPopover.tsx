import React, { useState, useRef, useEffect } from "react";
import { Info, X, ShieldCheck, FileCheck, CheckCircle2 } from "lucide-react";

export const GemSimulatorInfoPopover: React.FC = () => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-gov-blue dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition-all shadow-2xs"
        title="What is this GeM Simulator?"
        aria-label="What is this GeM Simulator?"
      >
        <Info className="w-3.5 h-3.5 text-gov-blue dark:text-blue-400" />
        <span className="hidden sm:inline">What is this GeM Simulator?</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-xl shadow-xl z-50 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-gov-border dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-gov-navy dark:text-white">
              <ShieldCheck className="w-4 h-4 text-gov-blue dark:text-blue-400" />
              <span>About GeM Portal Simulator</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded text-gov-text-secondary hover:text-gov-navy dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-gov-text-secondary dark:text-gray-300 leading-relaxed">
            The <strong>Government e-Marketplace (GeM) Simulator</strong> models how public procurement tenders are verified before being floated on GeM under <strong>Rule 149 of General Financial Rules (GFR 2017)</strong>.
          </p>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-2 text-gov-text dark:text-gray-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-gov-green dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Mandatory BIS QCO Enforcement:</strong> Evaluates if specifications cite statutory Quality Control Orders.</span>
            </div>
            <div className="flex items-start gap-2 text-gov-text dark:text-gray-200">
              <FileCheck className="w-3.5 h-3.5 text-gov-blue dark:text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Pre-bid Gate Simulation:</strong> Flags non-compliant clauses that lead to bid disqualification or vendor disputes.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
