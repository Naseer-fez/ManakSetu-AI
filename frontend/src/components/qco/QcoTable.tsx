import React from "react";
import { ShieldCheck } from "lucide-react";
import type { MandatoryQCO } from "../../types";

interface QcoTableProps {
  entries: [string, MandatoryQCO][];
  loading: boolean;
}

export const QcoTable: React.FC<QcoTableProps> = ({ entries, loading }) => {
  if (loading) {
    return <div className="p-8 text-center text-sm text-white/40 animate-pulse">Loading QCO records...</div>;
  }

  if (entries.length === 0) {
    return <div className="p-8 text-center text-sm text-white/40">No matching QCO records found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-white/5 text-white/40 border-b border-white/10">
          <tr>
            <th className="p-4 font-medium">Standard Code</th>
            <th className="p-4 font-medium">Scheme</th>
            <th className="p-4 font-medium">Order Number</th>
            <th className="p-4 font-medium">Issuing Ministry</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {entries.map(([code, q]) => (
            <tr key={code} className="hover:bg-white/5 transition-colors">
              <td className="p-4 font-semibold text-white/90">{code}</td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1 bg-apple-amber/20 text-apple-amber border border-apple-amber/30 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {q.scheme}
                </span>
              </td>
              <td className="p-4 text-white/70 font-mono text-xs">{q.order_number || "Statutory QCO"}</td>
              <td className="p-4 text-white/60">{q.issuing_ministry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
