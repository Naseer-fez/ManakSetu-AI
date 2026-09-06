"""Unit tests for RerankerService and dynamic path configuration."""
from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock
import pytest

from backend.config.paths import RERANKER_MODEL_PATH
from backend.engine.reranker_service import RerankerService
from backend.models.standard_model import IndianStandard


def test_reranker_service_initialization() -> None:
    """Verify RerankerService initializes with configured model name and path."""
    service = RerankerService()
    assert service is not None
    assert service._cross_encoder is None
    assert service._load_failed is False
    assert RERANKER_MODEL_PATH is not None


def test_reranker_empty_candidates() -> None:
    """Verify rerank returns an empty list when no candidates are provided."""
    service = RerankerService()
    results = service.rerank("cement compressive strength", [], top_k=5)
    assert results == []


def test_reranker_fallback_on_missing_weights(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify fallback behavior when cross-encoder weights are missing."""
    service = RerankerService()
    monkeypatch.setattr(RerankerService, "_cross_encoder", None)
    monkeypatch.setattr(service, "_cross_encoder", None)
    monkeypatch.setattr(RerankerService, "_load_failed", True)
    monkeypatch.setattr(service, "_load_failed", True)

    std1 = IndianStandard(
        is_code="IS 269",
        title="Ordinary Portland Cement",
        division="Civil Engineering",
        year=2015,
        scope="Covers 33 grade ordinary Portland cement",
    )
    candidates: list[tuple[IndianStandard, float, list[str]]] = [
        (std1, 0.85, ["hybrid baseline"]),
    ]

    results = service.rerank("Portland cement", candidates, top_k=1)
    assert len(results) == 1
    assert results[0][0].is_code == "IS 269"
    assert results[0][1] == 0.85


def test_reranker_with_mocked_model() -> None:
    """Verify cross-encoder scoring and sorting when model produces scores."""
    service = RerankerService()
    mock_model = MagicMock()
    mock_model.predict.return_value = [0.42, 0.95]
    service._cross_encoder = mock_model

    std1 = IndianStandard(
        is_code="IS 456",
        title="Plain and Reinforced Concrete",
        division="Civil Engineering",
        year=2000,
        scope="Code of practice for plain and reinforced concrete",
    )
    std2 = IndianStandard(
        is_code="IS 1786",
        title="High Strength Deformed Steel Bars",
        division="Civil Engineering",
        year=2008,
        scope="High strength deformed bars and wires for concrete reinforcement",
    )
    candidates: list[tuple[IndianStandard, float, list[str]]] = [
        (std1, 0.70, ["initial"]),
        (std2, 0.72, ["initial"]),
    ]

    reranked = service.rerank("steel rebar specification", candidates, top_k=2)
    assert len(reranked) == 2
    # std2 has score 0.95, so should be ranked first
    assert reranked[0][0].is_code == "IS 1786"
    assert reranked[0][1] == pytest.approx(0.95)
    assert reranked[1][0].is_code == "IS 456"
    assert reranked[1][1] == pytest.approx(0.42)
