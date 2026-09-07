import React from "react";
import { ShieldAlert } from "lucide-react";
import type { MandatoryQCO } from "@/types";

export interface QcoTableProps {
  entries: [string, MandatoryQCO][];
  loading: boolean;
}

export const QcoTable: React.FC<QcoTableProps> = ({ entries, loading }) => {
  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-gov-text-secondary dark:text-gray-400 bg-white dark:bg-[#111927]">
        Loading statutory Quality Control Orders from Bureau of Indian Standards...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-12 text-center text-sm text-gov-text-secondary dark:text-gray-400 bg-white dark:bg-[#111927]">
        No matching Quality Control Orders found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-gov-navy dark:bg-slate-800 text-white select-none sticky top-0">
          <tr>
            <th className="px-4 py-3 font-semibold uppercase tracking-wider">IS Code</th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Scheme</th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Order Number</th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Issuing Ministry</th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Effective Date</th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Clause Requirement</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gov-border dark:divide-slate-800">
          {entries.map(([code, q], idx) => (
            <tr
              key={code}
              className={idx % 2 === 0 ? "bg-white dark:bg-[#111927] hover:bg-gov-blue-light/50 dark:hover:bg-slate-800/60 transition-colors" : "bg-gov-offwhite dark:bg-[#0c1421] hover:bg-gov-blue-light/50 dark:hover:bg-slate-800/60 transition-colors"}
            >
              <td className="px-4 py-3 font-mono font-bold text-gov-navy dark:text-blue-400 whitespace-nowrap">
                {code}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/40 text-gov-red dark:text-rose-400 border border-red-200 dark:border-red-900/50 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase">
                  <ShieldAlert className="w-3 h-3" />
                  {q.scheme || "ISI MARK"}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-gov-text-secondary dark:text-gray-400 whitespace-nowrap">
                {q.order_number || "Statutory QCO"}
              </td>
              <td className="px-4 py-3 font-medium text-gov-text dark:text-gray-200">
                {q.issuing_ministry || "Ministry of Commerce & Industry"}
              </td>
              <td className="px-4 py-3 text-gov-text-secondary dark:text-gray-400 whitespace-nowrap">
                {q.effective_date || "Active / Immediate"}
              </td>
              <td className="px-4 py-3 text-gov-text dark:text-gray-300 max-w-xs truncate" title={q.clause_requirement || "Compulsory ISI Certification mark"}>
                {q.clause_requirement || "Compulsory ISI Certification mark"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QcoTable;
