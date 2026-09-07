import React, { useEffect, useState, useMemo } from "react";
import { Scale, Search, Filter } from "lucide-react";
import { fetchQcoList } from "@/services/api.service";
import { useRemembrance } from "@/context/RemembranceContext";
import { QcoTable } from "@/components/qco/QcoTable";
import type { MandatoryQCO } from "@/types";

export const QcoExplorerView: React.FC = () => {
  const { analysis } = useRemembrance();
  const [qcos, setQcos] = useState<Record<string, MandatoryQCO>>({});
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [tenderOnly, setTenderOnly] = useState(false);

  useEffect(() => {
    fetchQcoList()
      .then((data) => setQcos(data))
      .catch(() => setQcos({}))
      .finally(() => setLoading(false));
  }, []);

  const tenderStdCodes = useMemo(() => {
    const s = new Set<string>();
    analysis?.report?.items?.forEach((i) => {
      i.cited_standards.forEach((c) => s.add(c.trim().toUpperCase()));
      i.recommended_standards.forEach((r) => s.add(r.standard.is_code.trim().toUpperCase()));
    });
    return s;
  }, [analysis]);

  const entries = Object.entries(qcos).filter(([code, q]) => {
    const matchTender = !tenderOnly || tenderStdCodes.has(code.trim().toUpperCase());
    const matchFilter =
      !filter ||
      code.toLowerCase().includes(filter.toLowerCase()) ||
      q.issuing_ministry.toLowerCase().includes(filter.toLowerCase()) ||
      q.order_number.toLowerCase().includes(filter.toLowerCase());
    return matchTender && matchFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5">
      <div className="bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gov-navy dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-gov-saffron" />
            Statutory Quality Control Orders (QCO)
          </h2>
          <p className="text-xs text-gov-text-secondary dark:text-gray-400 mt-0.5">
            Official Indian standards under compulsory Bureau of Indian Standards (BIS) Scheme-I & CRS certification.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {tenderStdCodes.size > 0 && (
            <button
              onClick={() => setTenderOnly(!tenderOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                tenderOnly
                  ? "bg-gov-blue text-white border-gov-blue"
                  : "bg-white dark:bg-slate-800 text-gov-navy dark:text-gray-200 border-gov-border dark:border-slate-700 hover:bg-gov-offwhite dark:hover:bg-slate-700"
              }`}
              title="Filter by standards from loaded tender"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Tender QCOs ({tenderStdCodes.size})</span>
            </button>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search code, ministry, order..."
              className="w-full bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded pl-9 pr-3 py-1.5 text-xs text-gov-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gov-blue focus:border-gov-blue transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 border-b border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/60 flex items-center justify-between text-xs text-gov-text-secondary dark:text-gray-400 font-medium">
          <span>Showing <strong>{entries.length}</strong> active statutory orders</span>
          {tenderOnly && <span className="text-gov-blue font-semibold">Filtered by Active Tender</span>}
        </div>
        <QcoTable entries={entries} loading={loading} />
      </div>
    </div>
  );
};

export default QcoExplorerView;
