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
    <div className="pt-2 border-t border-gov-border dark:border-slate-800">
      <button
        onClick={() => setAccordionOpen(!accordionOpen)}
        className="flex items-center justify-between w-full py-2 px-3 rounded hover:bg-gov-offwhite dark:hover:bg-slate-800/80 text-xs font-semibold text-gov-text-secondary dark:text-gray-300 hover:text-gov-navy dark:hover:text-white transition-all group"
      >
        <span className="flex items-center gap-2">
          <GitFork className="w-3.5 h-3.5 text-gov-blue group-hover:scale-110 transition-transform" />
          <span>{accordionOpen ? "Hide allied standards" : `View ${totalAllied} allied standards`}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[10px] text-gov-blue dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/50">{totalAllied}</span>
        </span>
        {accordionOpen ? (
          <ChevronUp className="w-4 h-4 text-gov-text-secondary dark:text-gray-400 group-hover:text-gov-navy dark:group-hover:text-white transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gov-text-secondary dark:text-gray-400 group-hover:text-gov-navy dark:group-hover:text-white transition-colors" />
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
                <div className="text-[11px] font-semibold text-gov-text-secondary dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GitFork className="w-3 h-3 text-gov-blue" /> Normative References ({normativeRefs.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {normativeRefs.map((norm, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-gov-offwhite dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-gov-navy dark:text-gray-200 font-mono text-[11px]">
                      {norm}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {testMethods.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-gov-text-secondary dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-3 h-3 text-gov-green" /> Mandatory Test Methods ({testMethods.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {testMethods.map((test, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-gov-offwhite dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-gov-text dark:text-gray-200 text-[11px]">
                      {test}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {safetyCodes.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-gov-text-secondary dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-gov-amber" /> Safety Codes & Guidelines ({safetyCodes.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {safetyCodes.map((safe, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-gov-offwhite dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-gov-text dark:text-gray-200 text-[11px]">
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

export default AlliedStandardsAccordion;

