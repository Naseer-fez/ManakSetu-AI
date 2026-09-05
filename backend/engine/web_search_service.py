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
import os
import sqlite3
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import httpx

from backend.config.settings import app_settings
from backend.logger.app_logger import get_logger

logger = get_logger("engine.web_search_service")

_BRAVE_SEARCH_ENDPOINT = "https://api.search.brave.com/res/v1/web/search"


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
        try:
            with self._conn() as conn:
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
        h = self._hash(query)
        try:
            with self._conn() as conn:
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
        h = self._hash(query)
        try:
            with self._conn() as conn:
                conn.execute(
                    "INSERT OR REPLACE INTO web_search_cache (query_hash, results_json, created_at) VALUES (?, ?, ?)",
                    (h, json.dumps([asdict(r) for r in results]), time.time()),
                )
        except sqlite3.Error as exc:
            logger.warning(f"Cache write error: {exc}")

    def _delete(self, query_hash: str) -> None:
        try:
            with self._conn() as conn:
                conn.execute("DELETE FROM web_search_cache WHERE query_hash = ?", (query_hash,))
        except sqlite3.Error:
            pass


class WebSearchService:
    """Async Brave Search client with caching and graceful degradation."""

    def __init__(
        self,
        api_key_env_var: str | None = None,
        timeout_sec: int | None = None,
        cache_ttl_hours: int | None = None,
    ) -> None:
        ws = app_settings.web_search
        env_var = api_key_env_var or ws.api_key_env_var
        self._api_key: str = os.getenv(env_var, "")
        self._timeout = timeout_sec or ws.request_timeout_sec
        cache_db = Path(app_settings.cache.sqlite_db_path).parent / "web_search_cache.db"
        self._cache = _SearchCache(str(cache_db), cache_ttl_hours or ws.cache_ttl_hours)

        if not self._api_key:
            logger.warning(
                f"Brave Search API key not set (env var: {env_var}). "
                "Web search will return empty results."
            )

    async def search(
        self, scoped_query: str, top_k: int = 3, max_tokens: int = 500
    ) -> list[WebSearchResult]:
        """Execute a web search, returning up to *top_k* results within *max_tokens*.

        On any failure (network, auth, timeout) returns an empty list so the
        caller can proceed without web context (graceful degradation).
        """
        if not self._api_key:
            return []

        # --- Cache check ---
        cached = self._cache.get(scoped_query)
        if cached is not None:
            logger.info("Web search cache HIT")
            return _truncate_results(cached[:top_k], max_tokens)

        # --- Brave API call ---
        headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": self._api_key,
        }
        params: dict[str, Any] = {"q": scoped_query, "count": top_k}

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                resp = await client.get(
                    _BRAVE_SEARCH_ENDPOINT, headers=headers, params=params
                )
                resp.raise_for_status()
                data = resp.json()
        except httpx.TimeoutException:
            logger.warning(f"Brave Search timed out after {self._timeout}s")
            return []
        except httpx.HTTPStatusError as exc:
            logger.warning(f"Brave Search HTTP error {exc.response.status_code}")
            return []
        except (httpx.RequestError, ValueError, KeyError) as exc:
            logger.warning(f"Brave Search request error: {type(exc).__name__}: {exc}")
            return []

        # --- Parse results ---
        results = self._parse_response(data, top_k)
        if results:
            self._cache.put(scoped_query, results)

        return _truncate_results(results, max_tokens)

    @staticmethod
    def _parse_response(data: dict[str, Any], top_k: int) -> list[WebSearchResult]:
        """Extract ``WebSearchResult`` objects from the Brave API response."""
        web_results: list[dict[str, Any]] = (
            data.get("web", {}).get("results", [])
        )
        parsed: list[WebSearchResult] = []
        for item in web_results[:top_k]:
            title = item.get("title", "").strip()
            description = item.get("description", "").strip()
            url = item.get("url", "").strip()
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
