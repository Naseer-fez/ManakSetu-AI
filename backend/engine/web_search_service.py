"""Brave Search API client with SQLite result caching.

Responsibilities:
  1. Accept a guardrail-scoped query string.
  2. Check SQLite cache (hash-based, configurable TTL).
  3. On cache miss → call Brave Web Search API.
  4. Parse results into lightweight ``WebSearchResult`` objects.
  5. Truncate total text to a configurable token budget.
  6. Store results in cache.

Zero GPU usage.  Graceful degradation on any failure (returns empty list).
"""
from __future__ import annotations

import hashlib
import json
import sqlite3
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from backend.config.settings import app_settings
from backend.logger.app_logger import get_logger

logger = get_logger("engine.web_search_service")


@dataclass(frozen=True)
class WebSearchResult:
    """A single web search result."""

    title: str
    description: str
    url: str


def _estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token (English text heuristic)."""
    return max(1, len(text) // 4)


def _truncate_results(
    results: list[WebSearchResult], max_tokens: int
) -> list[WebSearchResult]:
    """Keep results until the cumulative token budget is exhausted."""
    kept: list[WebSearchResult] = []
    budget = max_tokens
    for r in results:
        cost = _estimate_tokens(f"{r.title} {r.description} {r.url}")
        if budget - cost < 0 and kept:
            break
        kept.append(r)
        budget -= cost
    return kept


class _SearchCache:
    """Thin SQLite cache for web search results with TTL expiry."""

    def __init__(self, db_path: str | Path, ttl_hours: int = 24) -> None:
        self._db_path = str(db_path)
        self._ttl_sec = ttl_hours * 3600
        self._ensure_table()

    def _conn(self) -> sqlite3.Connection:
        return sqlite3.connect(self._db_path, timeout=5)

    def _ensure_table(self) -> None:
        import contextlib
        try:
            with contextlib.closing(self._conn()) as conn:
                with conn:
                    conn.execute(
                        """CREATE TABLE IF NOT EXISTS web_search_cache (
                            query_hash TEXT PRIMARY KEY,
                            results_json TEXT NOT NULL,
                            created_at REAL NOT NULL
                        )"""
                    )
        except sqlite3.Error as exc:
            logger.warning(f"Cache table creation failed: {exc}")

    @staticmethod
    def _hash(query: str) -> str:
        return hashlib.sha256(query.encode("utf-8")).hexdigest()

    def get(self, query: str) -> list[WebSearchResult] | None:
        """Return cached results or ``None`` on miss / expiry."""
        import contextlib
        h = self._hash(query)
        try:
            with contextlib.closing(self._conn()) as conn:
                row = conn.execute(
                    "SELECT results_json, created_at FROM web_search_cache WHERE query_hash = ?",
                    (h,),
                ).fetchone()
            if row is None:
                return None
            if time.time() - row[1] > self._ttl_sec:
                self._delete(h)
                return None
            return [WebSearchResult(**r) for r in json.loads(row[0])]
        except (sqlite3.Error, json.JSONDecodeError, TypeError) as exc:
            logger.warning(f"Cache read error: {exc}")
            return None

    def put(self, query: str, results: list[WebSearchResult]) -> None:
        import contextlib
        h = self._hash(query)
        try:
            with contextlib.closing(self._conn()) as conn:
                with conn:
                    conn.execute(
                        "INSERT OR REPLACE INTO web_search_cache (query_hash, results_json, created_at) VALUES (?, ?, ?)",
                        (h, json.dumps([asdict(r) for r in results]), time.time()),
                    )
        except sqlite3.Error as exc:
            logger.warning(f"Cache write error: {exc}")

    def _delete(self, query_hash: str) -> None:
        import contextlib
        try:
            with contextlib.closing(self._conn()) as conn:
                with conn:
                    conn.execute("DELETE FROM web_search_cache WHERE query_hash = ?", (query_hash,))
        except sqlite3.Error:
            pass


class WebSearchService:
    """Async DuckDuckGo Search client with caching and graceful degradation."""

    def __init__(
        self,
        api_key_env_var: str | None = None, # Left for backward compatibility in tests
        timeout_sec: int | None = None,
        cache_ttl_hours: int | None = None,
    ) -> None:
        ws = app_settings.web_search
        self._timeout = timeout_sec or ws.request_timeout_sec
        cache_db = Path(app_settings.cache.sqlite_db_path).parent / "web_search_cache.db"
        self._cache = _SearchCache(str(cache_db), cache_ttl_hours or ws.cache_ttl_hours)

    async def search(
        self, scoped_query: str, top_k: int = 3, max_tokens: int = 500
    ) -> list[WebSearchResult]:
        """Execute a web search, returning up to *top_k* results within *max_tokens*.

        On any failure (network, auth, timeout) returns an empty list so the
        caller can proceed without web context (graceful degradation).
        """
        # --- Cache check ---
        cached = self._cache.get(scoped_query)
        if cached is not None:
            logger.info("Web search cache HIT")
            return _truncate_results(cached[:top_k], max_tokens)

        # --- DDG API call ---
        try:
            import asyncio
            from ddgs import DDGS
        except ImportError:
            logger.warning("ddgs package not found. Returning empty results.")
            return []

        try:
            with DDGS() as ddgs_client:
                raw_results = await asyncio.wait_for(
                    asyncio.to_thread(ddgs_client.text, scoped_query, max_results=top_k),
                    timeout=self._timeout
                )
        except asyncio.TimeoutError:
            logger.warning(f"DuckDuckGo search timed out after {self._timeout}s")
            return []
        except Exception as exc:
            logger.warning(f"DuckDuckGo Search error: {type(exc).__name__}: {exc}")
            return []

        # --- Parse results ---
        results = self._parse_response(raw_results, top_k)
        if results:
            self._cache.put(scoped_query, results)

        return _truncate_results(results, max_tokens)

    @staticmethod
    def _parse_response(data: Any, top_k: int) -> list[WebSearchResult]:
        """Extract ``WebSearchResult`` objects from the DDG API response."""
        if not data or not isinstance(data, list):
            return []
            
        parsed: list[WebSearchResult] = []
        for item in data[:top_k]:
            title = item.get("title", "").strip()
            description = item.get("body", "").strip()
            url = item.get("href", "").strip()
            if title and url:
                parsed.append(
                    WebSearchResult(title=title, description=description, url=url)
                )
        return parsed

    def format_for_prompt(self, results: list[WebSearchResult]) -> str:
        """Format search results as a compact text block for LLM prompt injection."""
        if not results:
            return ""
        lines = ["[Web Search Results]"]
        for i, r in enumerate(results, 1):
            lines.append(f"{i}. {r.title}")
            if r.description:
                lines.append(f"   {r.description}")
            lines.append(f"   Source: {r.url}")
        return "\n".join(lines)
