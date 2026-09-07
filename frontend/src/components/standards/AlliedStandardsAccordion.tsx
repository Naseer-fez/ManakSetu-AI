import React, { useState } from "react";
import { GitFork, ChevronUp, ChevronDown, FlaskConical, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AlliedStandardsAccordionProps {
  normativeRefs: string[];
  testMethods: string[];
  safetyCodes: string[];
}

export const AlliedStandardsAccordion: React.FC<AlliedStandardsAccordionProps> = ({
  normativeRefs,
  testMethods,
  safetyCodes,
}) => {
  const [accordionOpen, setAccordionOpen] = useState(false);
  const totalAllied = normativeRefs.length + testMethods.length + safetyCodes.length;
  if (totalAllied === 0) return null;

  return (
    <div className="pt-2 border-t border-white/5">
      <button
        onClick={() => setAccordionOpen(!accordionOpen)}
        className="flex items-center justify-between w-full py-2 px-3 rounded-xl hover:bg-white/5 text-xs font-semibold text-white/70 hover:text-white transition-all group"
      >
        <span className="flex items-center gap-2">
          <GitFork className="w-3.5 h-3.5 text-apple-indigo group-hover:scale-110 transition-transform" />
          <span>{accordionOpen ? "Hide allied standards" : `View ${totalAllied} allied standards`}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-white/60">{totalAllied}</span>
        </span>
        {accordionOpen ? (
          <ChevronUp className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
        )}
      </button>

      <AnimatePresence>
        {accordionOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pt-3 space-y-3"
          >
            {normativeRefs.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                  <GitFork className="w-3 h-3 text-apple-blue" /> Normative References ({normativeRefs.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {normativeRefs.map((norm, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white/80 font-mono text-[11px]">
                      {norm}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {testMethods.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-3 h-3 text-apple-mint" /> Mandatory Test Methods ({testMethods.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {testMethods.map((test, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white/80 text-[11px]">
                      {test}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {safetyCodes.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-apple-amber" /> Safety Codes & Guidelines ({safetyCodes.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {safetyCodes.map((safe, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white/80 text-[11px]">
                      {safe}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
