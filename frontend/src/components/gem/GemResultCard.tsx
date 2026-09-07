import React from "react";
import { CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { GemClauseBox } from "@/components/gem/GemClauseBox";

export interface GemValidationResultData {
  bid_id: string;
  status: string;
  compliance_score: number;
  primary_standard: string;
  is_qco_mandatory: boolean;
  qco_order?: string;
  recommended_clause?: string;
  allied_standards?: string[];
}

export interface GemResultCardProps {
  result: GemValidationResultData;
}

export const GemResultCard: React.FC<GemResultCardProps> = ({ result }) => {
  const scorePct = Math.round((result.compliance_score || 0) * 100);
  const isCompliant = result.status.toUpperCase() === "COMPLIANT" || result.status.toUpperCase() === "VERIFIED";

  return (
    <div className="bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {isCompliant ? (
            <CheckCircle2 className="w-5 h-5 text-gov-green" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-gov-amber" />
          )}
          <span className="font-bold text-sm text-gov-navy dark:text-white">
            GeM Bid Compliance Validation Result
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-gov-blue dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
            Score: {scorePct}%
          </span>
          <span
            className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isCompliant
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 dark:bg-amber-950/40 text-gov-amber dark:text-amber-400 border-amber-200 dark:border-amber-800"
            }`}
          >
            {result.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="bg-gov-offwhite dark:bg-slate-800/60 p-3 rounded border border-gov-border dark:border-slate-700">
          <span className="text-gov-text-secondary dark:text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">Primary Indian Standard</span>
          <span className="font-mono font-bold text-sm text-gov-navy dark:text-white mt-0.5 block">{result.primary_standard}</span>
        </div>
        <div className="bg-gov-offwhite dark:bg-slate-800/60 p-3 rounded border border-gov-border dark:border-slate-700">
          <span className="text-gov-text-secondary dark:text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">Statutory QCO Status</span>
          <div className="mt-1">
            {result.is_qco_mandatory ? (
              <span className="inline-flex items-center gap-1 text-gov-red dark:text-rose-400 font-semibold"><ShieldAlert className="w-3.5 h-3.5" /> Mandatory ({result.qco_order || "ISI Mark"})</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-gov-green dark:text-emerald-400 font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> Voluntary Scheme</span>
            )}
          </div>
        </div>
      </div>

      {result.recommended_clause && <GemClauseBox clause={result.recommended_clause} />}

      {result.allied_standards && result.allied_standards.length > 0 && (
        <div className="text-xs pt-1">
          <span className="font-semibold text-gov-text-secondary dark:text-gray-400 block mb-1.5">
            Allied Testing & Reference Standards:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {result.allied_standards.map((s, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gov-navy dark:text-gray-200 font-mono text-[11px] border border-gray-200 dark:border-slate-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GemResultCard;
