import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { TenderClauseBox } from "./standards/TenderClauseBox";
import { AlliedStandardsAccordion } from "./standards/AlliedStandardsAccordion";
import type { StandardRecommendation } from "../types";

interface GlassSpecCardProps {
  rec: StandardRecommendation;
}

export const GlassSpecCard: React.FC<GlassSpecCardProps> = ({ rec }) => {
  const { standard, relevance_score } = rec;
  const matchPct = Math.round(relevance_score * 100);
  const isMandatory = standard.mandatory_qco?.is_mandatory;

  return (
    <article className="apple-glass rounded-3xl p-6 border border-white/10 shadow-xl transition-all duration-300 space-y-4 hover:border-white/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white/95">
              {standard.is_code}
            </h3>
            {isMandatory ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-apple-red/20 text-apple-red border border-apple-red/30 shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5" /> Mandatory ISI Mark
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-apple-mint/20 text-apple-mint border border-apple-mint/30 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Voluntary Scheme
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white/70">
              {standard.division || "General"}
            </span>
          </div>
          <h4 className="text-sm font-medium text-white/75 leading-relaxed">
            {standard.title}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-apple-blue/15 border border-apple-blue/30 text-white text-xs font-semibold">
          <span>{matchPct}% Match</span>
        </div>
      </div>

      <TenderClauseBox
        clauseText={rec.sample_tender_clause}
        isCode={standard.is_code}
      />

      <AlliedStandardsAccordion
        normativeRefs={standard.normative_references || []}
        testMethods={standard.test_methods || []}
        safetyCodes={standard.safety_standards || []}
      />
    </article>
  );
};
export default GlassSpecCard;
