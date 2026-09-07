import React, { useState } from "react";
import { SpotlightSearch } from "./SpotlightSearch";
import { GlassSpecCard } from "./GlassSpecCard";
import { DivisionFilterPills } from "./standards/DivisionFilterPills";
import { fetchRecommendations } from "../services/api.service";
import type { RecommendationResponse } from "../types";
import { BookOpen, Sparkles } from "lucide-react";

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
    } catch {
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
    <div className="w-full max-w-4xl mx-auto space-y-6 flex flex-col items-center">
      <div className="w-full space-y-4">
        <SpotlightSearch
          query={query}
          setQuery={setQuery}
          onSearch={(val) => handleSearch(val)}
          loading={loading}
        />
        <DivisionFilterPills
          division={division}
          onSelectDivision={handleDivisionChange}
        />
      </div>

      {!data && !loading ? (
        <div className="w-full apple-glass p-12 text-center rounded-3xl space-y-3 border border-white/10 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-apple-blue/20 border border-apple-blue/30 text-apple-blue flex items-center justify-center mx-auto shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white/90">Indian Standards Search</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
            Search for materials, equipment, or products to discover official Bureau of Indian Standards,
            verify QCO mandatory compliance status, and copy approved GeM tender clauses.
          </p>
        </div>
      ) : loading && !data ? (
        <div className="w-full apple-glass p-12 text-center rounded-3xl space-y-3 border border-white/10 animate-pulse">
          <Sparkles className="w-6 h-6 text-apple-indigo mx-auto animate-spin" />
          <p className="text-sm font-medium text-white/60">
            Analyzing procurement query across Bureau of Indian Standards...
          </p>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between px-2 text-xs text-white/50 font-medium">
            <span>Found <strong>{data?.total_matches || 0}</strong> standard recommendations</span>
            {data?.latency_ms !== undefined && <span>Latency: {data.latency_ms}ms</span>}
          </div>
          <div className="space-y-4">
            {data?.recommendations.map(rec => (
              <GlassSpecCard key={rec.standard.is_code} rec={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
