import React, { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { SearchInputBar } from "@/components/recommend/SearchInputBar";
import { DivisionFilterBar } from "@/components/recommend/DivisionFilterBar";
import { StandardCardItem } from "@/components/recommend/StandardCardItem";
import { fetchRecommendations } from "@/services/api.service";
import type { RecommendationResponse } from "@/types";

export const RecommendationTab: React.FC = () => {
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecommendationResponse | null>(null);

  const handleSearch = async (customQ?: string, customDiv?: string) => {
    const q = customQ !== undefined ? customQ : query;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const activeDiv = customDiv !== undefined ? customDiv : division;
      const divParam = activeDiv === "All" || !activeDiv ? undefined : activeDiv;
      const res = await fetchRecommendations(q, divParam);
      setData(res);
    } catch (err: unknown) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDivisionChange = (div: string) => {
    setDivision(div);
    if (query.trim()) handleSearch(query, div);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-gov-navy dark:text-white tracking-tight">
            Indian Standards (IS) Recommendation Engine
          </h2>
          <p className="text-xs text-gov-text-secondary dark:text-gray-400 mt-0.5">
            Search materials, equipment, or products for mandatory QCO orders and approved GeM tender clauses.
          </p>
        </div>

        <SearchInputBar
          query={query}
          setQuery={setQuery}
          onSearch={(val) => handleSearch(val)}
          loading={loading}
        />

        <DivisionFilterBar
          division={division}
          onSelectDivision={handleDivisionChange}
        />
      </div>

      {!data && !loading ? (
        <div className="bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-lg bg-gov-blue-light dark:bg-blue-950/60 text-gov-blue dark:text-blue-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gov-navy dark:text-white">Search Bureau of Indian Standards</h3>
          <p className="text-xs text-gov-text-secondary dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
            Enter keywords or IS codes to identify applicable national standards, normative references, mandatory testing methods, and statutory QCO compliance requisites.
          </p>
        </div>
      ) : loading && !data ? (
        <div className="bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg p-12 text-center shadow-sm space-y-3">
          <Sparkles className="w-6 h-6 text-gov-blue dark:text-blue-400 mx-auto animate-spin" />
          <p className="text-sm font-medium text-gov-navy dark:text-white">
            Evaluating procurement query across Bureau of Indian Standards...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs text-gov-text-secondary dark:text-gray-400 font-medium">
            <span>Found <strong className="text-gov-navy dark:text-white">{data?.total_matches || 0}</strong> standard recommendations</span>
            {data?.latency_ms !== undefined && <span>Search Latency: {data.latency_ms}ms</span>}
          </div>

          <div className="space-y-4">
            {data?.recommendations.map((rec) => (
              <StandardCardItem key={rec.standard.is_code} rec={rec} query={query} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationTab;
