import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { StandardRecommendation } from "@/types";
import { TenderClauseBuilder } from "@/components/recommend/TenderClauseBuilder";
import { LlmStreamExplanation } from "@/components/recommend/LlmStreamExplanation";
import { AlliedStandardsAccordion } from "@/components/standards/AlliedStandardsAccordion";

export interface StandardCardItemProps {
  rec: StandardRecommendation;
  query: string;
}

export const StandardCardItem: React.FC<StandardCardItemProps> = ({ rec, query }) => {
  const { standard, relevance_score } = rec;
  const matchPct = Math.round(relevance_score * 100);
  const isMandatory = standard.mandatory_qco?.is_mandatory;

  return (
    <article className="bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg p-5 shadow-sm space-y-4 hover:border-gray-400 dark:hover:border-slate-600 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-gov-navy dark:text-white tracking-tight font-mono">
              {standard.is_code}
            </h3>

            {isMandatory ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-gov-red dark:text-rose-400 border border-red-200 dark:border-red-900/50">
                <ShieldAlert className="w-3.5 h-3.5" /> Mandatory ISI Mark
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Voluntary Scheme
              </span>
            )}

            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-slate-800 text-gov-text-secondary dark:text-gray-300 border border-gray-200 dark:border-slate-700">
              {standard.division || "General"}
            </span>

            {standard.year && (
              <span className="text-xs text-gov-text-secondary dark:text-gray-400">({standard.year})</span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-gov-text dark:text-gray-100 leading-snug">
            {standard.title}
          </h4>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-gov-blue dark:text-blue-400 text-xs font-bold">
          <span>{matchPct}% Match</span>
        </div>
      </div>

      <LlmStreamExplanation
        isCode={standard.is_code}
        query={query}
        title={standard.title}
      />

      <TenderClauseBuilder
        isCode={standard.is_code}
        initialClause={rec.sample_tender_clause}
        certificationAlert={rec.certification_alert}
      />

      <AlliedStandardsAccordion
        normativeRefs={standard.normative_references || []}
        testMethods={standard.test_methods || []}
        safetyCodes={standard.safety_standards || []}
      />
    </article>
  );
};

export default StandardCardItem;
