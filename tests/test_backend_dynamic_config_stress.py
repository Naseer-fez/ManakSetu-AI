"""Empirical Challenger stress-tests for Backend Dynamic Config Resolution and Resilience.

Covers:
1. OLLAMA_BASE_URL dynamic configuration, custom overrides, and offline resilience.
2. EMBEDDING_MODEL dynamic resolution in vectordb/src/config.py and EmbeddingService fallback.
3. RerankerService fallback mechanics when model weights are missing or CrossEncoder fails.
4. Static analysis asserting absence of hardcoded drive letters in backend/ and root scripts.
"""
from __future__ import annotations

import importlib
import os
import re
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock, patch

import pytest

from backend.config.paths import PROJECT_ROOT, RERANKER_MODEL_PATH
from backend.engine.llm_providers import (
    DeterministicFallbackProvider,
    OpenAiLlmProvider,
)
from backend.engine.llm_service import _CACHE, _LOCK, get_llm_provider
from backend.engine.reranker_service import RerankerService
from backend.models.standard_model import IndianStandard
from vectordb.src.embeddings import EmbeddingService


# =====================================================================
# Suite 1: OLLAMA_BASE_URL Dynamic Configuration & Offline Resilience
# =====================================================================

def test_ollama_base_url_default_resolution(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify default Ollama URL resolution when OLLAMA_BASE_URL is unset."""
    monkeypatch.delenv("OLLAMA_BASE_URL", raising=False)
    with _LOCK:
        _CACHE.pop("ollama", None)
    
    provider = get_llm_provider("ollama")
    assert isinstance(provider, OpenAiLlmProvider)
    assert provider._base_url == "http://localhost:11434/v1"


def test_ollama_base_url_custom_override(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify custom OLLAMA_BASE_URL override is correctly propagated."""
    custom_url = "http://remote-gpu-server:11434/v1"
    monkeypatch.setenv("OLLAMA_BASE_URL", custom_url)
    with _LOCK:
        _CACHE.pop("ollama", None)

    provider = get_llm_provider("ollama")
    assert isinstance(provider, OpenAiLlmProvider)
    assert provider._base_url == custom_url


@pytest.mark.asyncio
async def test_ollama_offline_fallback_resilience(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify OpenAiLlmProvider gracefully degrades when Ollama endpoint is offline/unreachable."""
    unreachable_url = "http://127.0.0.1:59999/v1"
    monkeypatch.setenv("OLLAMA_BASE_URL", unreachable_url)
    provider = OpenAiLlmProvider(base_url=unreachable_url)

    # 1. generate_text should not crash; must return fallback message
    res = await provider.generate_text("Explain IS 456 concrete durability requirements.")
    assert isinstance(res, str)
    assert "No LLM model is currently available" in res

    # 2. generate_text_stream should safely yield fallback stream chunks
    chunks: list[str] = []
    async for chunk in provider.generate_text_stream("Explain IS 456 concrete durability requirements."):
        chunks.append(chunk)
    assert len(chunks) > 0
    full_text = "".join(chunks)
    assert "No LLM model is currently available" in full_text


def test_ollama_provider_does_not_require_openai_api_key() -> None:
    """Verify Ollama OpenAiLlmProvider does not abort if OPENAI_API_KEY is unset."""
    provider = OpenAiLlmProvider(base_url="http://localhost:11434/v1", api_key="")
    assert provider._api_key == ""
    assert "openai" not in provider._base_url


# =====================================================================
# Suite 2: EMBEDDING_MODEL Resolution & EmbeddingService Fallback
# =====================================================================

def test_vectordb_config_embedding_model_default(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify vectordb/src/config.py defaults EMBEDDING_MODEL to all-MiniLM-L6-v2 when unset."""
    monkeypatch.delenv("EMBEDDING_MODEL", raising=False)
    import vectordb.src.config as v_cfg
    importlib.reload(v_cfg)
    assert v_cfg.EMBEDDING_MODEL == "all-MiniLM-L6-v2"


def test_vectordb_config_embedding_model_override(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify vectordb/src/config.py dynamically adopts EMBEDDING_MODEL from env."""
    custom_model = "sentence-transformers/all-mpnet-base-v2"
    monkeypatch.setenv("EMBEDDING_MODEL", custom_model)
    import vectordb.src.config as v_cfg
    importlib.reload(v_cfg)
    assert v_cfg.EMBEDDING_MODEL == custom_model
    # Clean up environment after test
    monkeypatch.delenv("EMBEDDING_MODEL", raising=False)
    importlib.reload(v_cfg)


def test_embedding_service_minilm_dimension_and_batch() -> None:
    """Verify default MiniLM initializes and generates normalized 384-dimensional embeddings."""
    svc = EmbeddingService(model_name="all-MiniLM-L6-v2")
    assert svc.dimension == 384

    # Empty batch returns empty list
    assert svc.embed_batch([]) == []

    # Single text batch returns 384-dim normalized vector
    results = svc.embed_batch(["Hot rolled medium and high tensile structural steel IS 2062"])
    assert len(results) == 1
    assert len(results[0]) == 384
    assert isinstance(results[0][0], float)


def test_embedding_service_graceful_fallback_on_unresolvable_model() -> None:
    """Verify EmbeddingService falls back to ONNX MiniLM if target model cannot be loaded."""
    # When initialized with an unknown model name in an offline / missing environment
    svc = EmbeddingService(model_name="nonexistent-custom-transformer-model-v99")
    # Must safely fall back without unhandled exception
    assert svc.engine is not None
    assert svc.dimension == 384
    results = svc.embed_batch(["TMT rebar testing specification"])
    assert len(results) == 1
    assert len(results[0]) == 384


# =====================================================================
# Suite 3: RerankerService Resilience & Missing Weight Fallback
# =====================================================================

def test_reranker_missing_model_graceful_fallback() -> None:
    """Verify RerankerService marks _load_failed=True and falls back to hybrid candidates."""
    RerankerService._cross_encoder = None
    RerankerService._load_failed = False

    service = RerankerService()
    service._model_name = "completely/nonexistent/reranker/path"

    std1 = IndianStandard(
        is_code="IS 10262",
        title="Concrete Mix Proportioning",
        division="Civil Engineering",
        year=2019,
        scope="Guidelines for concrete mix design",
    )
    std2 = IndianStandard(
        is_code="IS 456",
        title="Plain and Reinforced Concrete",
        division="Civil Engineering",
        year=2000,
        scope="Code of practice for plain and reinforced concrete",
    )
    candidates: list[tuple[IndianStandard, float, list[str]]] = [
        (std1, 0.88, ["hybrid baseline 1"]),
        (std2, 0.75, ["hybrid baseline 2"]),
    ]

    # Force CrossEncoder constructor to fail
    with patch("sentence_transformers.CrossEncoder", side_effect=OSError("Weights not found on disk")):
        # 1. Preload should return False gracefully
        assert service.preload() is False
        assert service._load_failed is True
        assert RerankerService._load_failed is True

        # 2. Warmup should return False gracefully
        assert service.warmup() is False

        # 3. Rerank should return original candidates unmodified up to top_k
        reranked = service.rerank("Concrete mix proportioning guide", candidates, top_k=2)
        assert len(reranked) == 2
        assert reranked[0][0].is_code == "IS 10262"
        assert reranked[0][1] == 0.88
        assert reranked[1][0].is_code == "IS 456"
        assert reranked[1][1] == 0.75

    # Reset static state for isolation
    RerankerService._cross_encoder = None
    RerankerService._load_failed = False


def test_reranker_prediction_runtime_error_fallback() -> None:
    """Verify that if cross-encoder raises RuntimeError (e.g. CUDA OOM), rerank falls back."""
    service = RerankerService()
    mock_model = MagicMock()
    mock_model.predict.side_effect = RuntimeError("CUDA out of memory during batch scoring")
    service._cross_encoder = mock_model

    std = IndianStandard(
        is_code="IS 1786",
        title="High Strength Deformed Steel Bars",
        division="Civil Engineering",
        year=2008,
        scope="Reinforcement bars",
    )
    candidates = [(std, 0.92, ["baseline"])]

    # Must catch RuntimeError and return candidates[:top_k]
    res = service.rerank("high strength rebar", candidates, top_k=1)
    assert len(res) == 1
    assert res[0][0].is_code == "IS 1786"
    assert res[0][1] == 0.92


# =====================================================================
# Suite 4: Static Analysis for Hardcoded Absolute Paths
# =====================================================================

def test_no_hardcoded_drive_paths_in_backend_python_files() -> None:
    """Assert zero occurrences of hardcoded drive letters in all active backend .py files."""
    backend_dir = PROJECT_ROOT / "backend"
    path_regex = re.compile(r"['\"][a-zA-Z]:[/\\][a-zA-Z0-9_\-]", re.IGNORECASE)

    violations: list[str] = []
    for py_file in backend_dir.rglob("*.py"):
        if "__pycache__" in py_file.parts:
            continue
        content = py_file.read_text(encoding="utf-8", errors="ignore")
        for idx, line in enumerate(content.splitlines(), 1):
            if path_regex.search(line):
                violations.append(f"{py_file.relative_to(PROJECT_ROOT)}:{idx} -> {line.strip()}")

    assert not violations, f"Hardcoded absolute paths found in backend: {violations}"


def test_no_hardcoded_drive_paths_in_root_python_scripts() -> None:
    """Assert zero occurrences of hardcoded drive letters in root executable Python scripts."""
    root_scripts = [
        "run_all.py",
        "interactive_llm.py",
        "verify_runtime_engine.py",
        "profile_vram.py",
        "ai_detector.py",
        "build_mac_bundle.py",
        "create_docx.py",
    ]
    path_regex = re.compile(r"['\"][a-zA-Z]:[/\\][a-zA-Z0-9_\-]", re.IGNORECASE)

    violations: list[str] = []
    for script_name in root_scripts:
        script_path = PROJECT_ROOT / script_name
        if not script_path.exists():
            continue
        content = script_path.read_text(encoding="utf-8", errors="ignore")
        for idx, line in enumerate(content.splitlines(), 1):
            if path_regex.search(line):
                violations.append(f"{script_name}:{idx} -> {line.strip()}")

    assert not violations, f"Hardcoded absolute paths found in root scripts: {violations}"
