import React from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";

interface GemResultCardProps {
  result: {
    status: string;
    primary_standard: string;
    is_qco_mandatory: boolean;
    qco_order?: string;
  };
}

export const GemResultCard: React.FC<GemResultCardProps> = ({ result }) => {
  return (
    <div className="apple-glass-dark border border-apple-mint/40 p-6 rounded-3xl space-y-4 shadow-[0_0_40px_rgba(48,209,88,0.15)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <span className="font-semibold text-white tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-apple-mint" /> Bid Validation Successful
        </span>
        <span className="px-3 py-1 rounded-full bg-apple-mint/20 text-apple-mint text-xs font-bold uppercase tracking-wider">
          {result.status}
        </span>
      </div>
      <div className="text-white/70 text-sm">
        <span className="text-white/40">Primary Standard:</span>{" "}
        <span className="font-medium text-white/90">{result.primary_standard}</span>
      </div>
      {result.is_qco_mandatory && (
        <div className="bg-apple-red/20 border border-apple-red/30 p-3 rounded-xl text-apple-red text-sm flex items-center gap-2 font-medium">
          <ShieldAlert className="w-5 h-5" />
          Mandatory QCO Enforced: {result.qco_order}
        </div>
      )}
    </div>
  );
};
