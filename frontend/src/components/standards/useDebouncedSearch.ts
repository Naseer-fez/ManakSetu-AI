import { useEffect, useRef } from "react";

export function useDebouncedSearch(query: string, onSearch: (val?: string) => void) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchedQueryRef = useRef<string>("");

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const trimmed = query.trim();
    if (!trimmed) {
      lastSearchedQueryRef.current = "";
      return;
    }

    if (trimmed !== lastSearchedQueryRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        lastSearchedQueryRef.current = trimmed;
        onSearch(trimmed);
      }, 2000);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, onSearch]);

  const handleManualSearch = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const trimmed = query.trim();
    if (trimmed) {
      lastSearchedQueryRef.current = trimmed;
      onSearch(trimmed);
    }
  };

  const clearQuery = (setQuery: (val: string) => void) => {
    setQuery("");
    lastSearchedQueryRef.current = "";
  };

  return { handleManualSearch, clearQuery };
}
