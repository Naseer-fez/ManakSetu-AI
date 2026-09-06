"""Tests for the web search service."""
from __future__ import annotations

import asyncio
import json
import sqlite3
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from backend.engine.web_search_service import WebSearchResult, WebSearchService, _SearchCache


@pytest.fixture
def mock_db_path() -> str:
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        temp_path = f.name
    yield temp_path
    try:
        Path(temp_path).unlink(missing_ok=True)
    except PermissionError:
        pass


def test_cache_put_and_get(mock_db_path: str) -> None:
    cache = _SearchCache(mock_db_path, ttl_hours=24)
    query = "test query site:bis.gov.in"
    results = [
        WebSearchResult(title="T1", description="D1", url="U1"),
        WebSearchResult(title="T2", description="D2", url="U2"),
    ]
    
    # Store
    cache.put(query, results)
    
    # Retrieve
    cached = cache.get(query)
    assert cached is not None
    assert len(cached) == 2
    assert cached[0].title == "T1"


def test_cache_miss(mock_db_path: str) -> None:
    cache = _SearchCache(mock_db_path, ttl_hours=24)
    cached = cache.get("unknown query")
    assert cached is None


@pytest.mark.asyncio
@patch("ddgs.DDGS.text")
async def test_search_calls_api_on_cache_miss(mock_text: MagicMock) -> None:
    mock_text.return_value = [
        {"title": "API_T1", "body": "API_D1", "href": "API_U1"}
    ]

    with patch("backend.config.settings.app_settings") as mock_settings:
        # Use in-memory DB for test
        mock_settings.cache.sqlite_db_path = ":memory:"
        
        service = WebSearchService()
        
        # Monkey patch cache to be memory DB
        service._cache = _SearchCache(":memory:")
        
        res = await service.search("query", top_k=1, max_tokens=100)
        
        assert len(res) == 1
        assert res[0].title == "API_T1"
        assert res[0].description == "API_D1"
        assert res[0].url == "API_U1"
        assert mock_text.called


@pytest.mark.asyncio
@patch("ddgs.DDGS.text")
async def test_search_graceful_degradation_on_exception(mock_text: MagicMock) -> None:
    mock_text.side_effect = Exception("Timeout")
    
    with patch("backend.config.settings.app_settings") as mock_settings:
        mock_settings.cache.sqlite_db_path = ":memory:"
        service = WebSearchService()
        service._cache = _SearchCache(":memory:")
        
        res = await service.search("query")
        assert res == []
