"""Unit and integration tests for LLM-audited recommendation filtering in BIS-SpecAI."""
from __future__ import annotations

import os
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from backend.config.settings import load_settings, app_settings
from backend.engine.hybrid_retriever import HybridRetriever
from backend.engine.recommendation_auditor import RecommendationAuditor
from backend.main import app
from backend.models.standard_model import IndianStandard

client = TestClient(app)


def test_threshold_configuration_and_env_override() -> None:
    """Test default threshold is 0.35 and can be overridden via MIN_RELEVANCE_SCORE."""
    assert app_settings.ai_engine.min_relevance_score == 0.35
    assert app_settings.ai_engine.similarity_threshold == 0.35

    with patch.dict(os.environ, {"MIN_RELEVANCE_SCORE": "0.45"}):
        custom_settings = load_settings()
        assert custom_settings.ai_engine.min_relevance_score == 0.45
        assert custom_settings.ai_engine.similarity_threshold == 0.45


def test_retriever_returns_candidate_hypothesis() -> None:
    """Verify retriever retrieves top candidates without dropping natural queries."""
    retriever = HybridRetriever()
    results = retriever.search("I need plastic pipes for our housing drainage system", top_k=5)
    assert len(results) > 0
    assert len(results) <= 5
    codes = [std.is_code for std, _, _ in results]
    assert any("4984" in code for code in codes)


@pytest.mark.asyncio
async def test_recommendation_auditor_filters_noise_unit() -> None:
    """Verify recommendation auditor keeps relevant candidates and discards noise."""
    std1 = IndianStandard(is_code="IS 4984:2016", title="HDPE Pipes", division="Civil", year=2016, scope="Pipes for drainage")
    std2 = IndianStandard(is_code="IS 12269:2013", title="Cement", division="Civil", year=2013, scope="Portland cement")

    candidates = [
        (std1, 0.65, ["BM25 match"]),
        (std2, 0.08, ["BM25 match"]),
    ]

    mock_provider = AsyncMock()
    mock_provider.generate_text.return_value = (
        '[{"is_code": "IS 4984:2016", "is_relevant": true, "reason": "Relevant for pipes"},'
        ' {"is_code": "IS 12269:2013", "is_relevant": false, "reason": "Cement is not pipe"}]'
    )

    auditor = RecommendationAuditor(provider=mock_provider)
    audited = await auditor.audit_candidates("plastic pipes for drainage", candidates)

    assert len(audited) == 1
    assert audited[0][0].is_code == "IS 4984:2016"
    assert any("LLM Audit: Relevant for pipes" in r for r in audited[0][2])


def test_recommend_endpoint_filters_weak_matches() -> None:
    """Verify POST /api/v1/recommend returns only strong recommendations (max 5)."""
    payload = {"query": "Supply of TMT steel rebar Fe 500D", "top_k": 5}
    res = client.post("/api/v1/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["total_matches"] > 0
    assert len(data["recommendations"]) == data["total_matches"]
    assert len(data["recommendations"]) <= 5

    for rec in data["recommendations"]:
        assert rec["standard"]["is_code"]
        assert rec["standard"]["title"]
        assert rec["standard"]["division"]
        assert isinstance(rec["match_reasons"], list)
        assert "certification_alert" in rec

    rec_scores = [r["relevance_score"] for r in data["recommendations"]]
    assert rec_scores == sorted(rec_scores, reverse=True)


def test_zero_result_for_irrelevant_query() -> None:
    """Verify irrelevant query returns empty list and helpful user-facing message."""
    payload = {"query": "quantum flux capacitor warp engine", "top_k": 5}
    res = client.post("/api/v1/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["total_matches"] == 0
    assert data["recommendations"] == []
    assert data["document_evidences"] == []
    assert data["message"] == "No sufficiently relevant standards found. Try a more specific query."


def test_mandatory_qco_status_remains_separate() -> None:
    """Verify mandatory QCO status does not fabricate or inflate relevance score."""
    payload = {"query": "plastic pipes for plumbing drainage", "top_k": 5}
    res = client.post("/api/v1/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()

    rec_codes = [r["standard"]["is_code"] for r in data["recommendations"]]
    assert any("4984" in code for code in rec_codes)

    for rec in data["recommendations"]:
        assert "mandatory_qco" in rec["standard"]
