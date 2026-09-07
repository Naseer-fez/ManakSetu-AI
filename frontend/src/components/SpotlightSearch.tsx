import React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useDebouncedSearch } from "./standards/useDebouncedSearch";
import { clsx } from "clsx";

interface SpotlightSearchProps {
  query: string;
  setQuery: (val: string) => void;
  onSearch: (val?: string) => void;
  loading: boolean;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({
  query,
  setQuery,
  onSearch,
  loading,
}) => {
  const { handleManualSearch, clearQuery } = useDebouncedSearch(query, onSearch);

  return (
    <div className="relative max-w-2xl mx-auto w-full group">
      <div
        className={clsx(
          "apple-glass-dark rounded-2xl flex items-center px-4 py-2.5 transition-all border border-white/10 shadow-xl",
          "focus-within:ring-2 focus-within:ring-apple-blue/50 focus-within:border-apple-blue/50 focus-within:bg-black/80"
        )}
      >
        <button
          type="button"
          onClick={handleManualSearch}
          disabled={loading || !query.trim()}
          title="Search"
          className="text-white/40 hover:text-white disabled:opacity-40 transition-colors mr-3"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-apple-blue" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleManualSearch()}
          placeholder="Search standards (e.g. Solar PV module, TMT bars, HDPE pipes)..."
          className="w-full bg-transparent text-sm md:text-base text-white placeholder-white/35 focus:outline-none"
        />

        {query && (
          <button
            onClick={() => clearQuery(setQuery)}
            className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors mr-2"
            title="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleManualSearch}
          disabled={loading || !query.trim()}
          className="px-4 py-1.5 bg-apple-blue hover:bg-apple-blue/80 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-apple-blue/20 shrink-0"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="text-center mt-2">
        <span className="text-[11px] text-white/30 font-medium">
          Auto-searches 2s after typing or press Enter
        </span>
      </div>
    </div>
  );
};
export default SpotlightSearch;
