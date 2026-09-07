import React, { useEffect, useState, useMemo } from "react";
import { Scale, Search, Filter } from "lucide-react";
import { fetchQcoList } from "../services/api.service";
import { useRemembrance } from "../context/RemembranceContext";
import { QcoTable } from "./qco/QcoTable";
import type { MandatoryQCO } from "../types";

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
    analysis?.report?.items?.forEach(i => {
      i.cited_standards.forEach(c => s.add(c.trim().toUpperCase()));
      i.recommended_standards.forEach(r => s.add(r.standard.is_code.trim().toUpperCase()));
    });
    return s;
  }, [analysis]);

  const entries = Object.entries(qcos).filter(([code, q]) => {
    const matchTender = !tenderOnly || tenderStdCodes.has(code.trim().toUpperCase());
    const matchFilter = !filter ||
      code.toLowerCase().includes(filter.toLowerCase()) ||
      q.issuing_ministry.toLowerCase().includes(filter.toLowerCase()) ||
      q.order_number.toLowerCase().includes(filter.toLowerCase());
    return matchTender && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between apple-glass p-6 rounded-3xl gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-apple-amber" />
            Mandatory Quality Control Orders (QCO)
          </h3>
          <p className="text-sm text-white/50 mt-1">Official Indian standards under compulsory BIS ISI Mark certification.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {tenderStdCodes.size > 0 && (
            <button
              onClick={() => setTenderOnly(!tenderOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                tenderOnly ? "bg-apple-amber text-black border-apple-amber" : "bg-white/10 text-white/70 border-white/10"
              }`}
              title="Filter by standards from uploaded tender"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Tender QCOs ({tenderStdCodes.size})</span>
            </button>
          )}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
            <input
              type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter code or ministry..."
              className="w-full bg-black/40 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-apple-amber"
            />
          </div>
        </div>
      </div>

      <div className="apple-glass rounded-3xl overflow-hidden border border-white/10">
        <QcoTable entries={entries} loading={loading} />
      </div>
    </div>
  );
};
