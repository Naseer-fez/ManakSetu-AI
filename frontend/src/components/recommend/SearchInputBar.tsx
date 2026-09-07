import React, { useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";

export interface SearchInputBarProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (q: string) => void;
  loading: boolean;
}

export const SearchInputBar: React.FC<SearchInputBarProps> = ({
  query,
  setQuery,
  onSearch,
  loading,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) return;
    timerRef.current = setTimeout(() => {
      onSearch(query);
    }, 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (timerRef.current) clearTimeout(timerRef.current);
      onSearch(query);
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gov-navy dark:text-blue-400">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gov-blue dark:text-blue-400" />
        ) : (
          <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search Indian Standards, e.g. TMT Steel Rebars, Solar Inverter, Fire Extinguisher, IS 1786..."
        className="w-full bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-700 rounded-lg pl-11 pr-24 py-3 text-sm text-gov-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-blue focus:border-gov-blue transition-all"
      />

      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-2">
        {query && (
          <button
            onClick={() => {
              setQuery("");
              if (timerRef.current) clearTimeout(timerRef.current);
            }}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gov-text dark:hover:text-white"
            title="Clear query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            onSearch(query);
          }}
          disabled={loading || !query.trim()}
          className="px-3 py-1.5 bg-gov-blue hover:bg-blue-700 disabled:opacity-40 rounded text-xs font-semibold text-white shadow-sm transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchInputBar;
