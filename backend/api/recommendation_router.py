"""Router for AI standard recommendations and dual-index search queries."""
from __future__ import annotations
import asyncio
import time
from fastapi import APIRouter
from backend.config.settings import app_settings
from backend.engine.certification_advisor import CertificationAdvisor
from backend.engine.hybrid_retriever import HybridRetriever
from backend.engine.multilingual_processor import MultilingualProcessor
from backend.engine.normative_resolver import NormativeResolver
from backend.engine.recommendation_auditor import RecommendationAuditor
from backend.engine.tender_clause_generator import TenderClauseGenerator
from backend.models.recommendation_model import RecommendationRequest, RecommendationResponse, StandardRecommendation
from backend.engine.singleton_registry import get_singleton

router = APIRouter(prefix="/api/v1", tags=["recommendations"])
multilingual_proc = MultilingualProcessor()
retriever = get_singleton("hybrid_retriever", HybridRetriever)
resolver = get_singleton("normative_resolver", NormativeResolver)
cert_advisor = get_singleton("certification_advisor", CertificationAdvisor)
clause_gen = get_singleton("tender_clause_generator", TenderClauseGenerator)
auditor = get_singleton("recommendation_auditor", RecommendationAuditor)


@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(req: RecommendationRequest) -> RecommendationResponse:
    """Recommend most relevant Indian Standards and grounded PDF document chunk evidences."""
    start_time = time.perf_counter()
    expanded_query, detected_lang = await asyncio.to_thread(multilingual_proc.translate_and_expand, req.query)
    eff_top_k = min(req.top_k, 5)

    raw_matches, evidences = await asyncio.to_thread(
        retriever.search_with_evidence, expanded_query, req.division, eff_top_k, 5
    )
    audited_matches = await auditor.audit_candidates(query=req.query, candidates=raw_matches)

    recommendations: list[StandardRecommendation] = []
    for std, score, reasons in audited_matches:
        allied = resolver.resolve_allied(std) if req.include_allied else []
        dep_warning = resolver.check_deprecation(std)
        cert_alert = cert_advisor.get_certification_alert(std)
        clause = clause_gen.generate_clause(std)
        std_evidences = [e for e in evidences if e.matched_standard == std.is_code] or evidences[:2]

        recommendations.append(
            StandardRecommendation(
                standard=std, relevance_score=round(score, 4), match_reasons=reasons,
                allied_standards=allied, document_evidences=std_evidences,
                certification_alert=cert_alert, deprecation_warning=dep_warning,
                sample_tender_clause=clause,
            )
        )

    recommendations.sort(key=lambda r: r.relevance_score, reverse=True)
    recommendations = recommendations[:5]

    message: str | None = None
    if not recommendations:
        message = "No sufficiently relevant standards found. Try a more specific query."

    elapsed = (time.perf_counter() - start_time) * 1000.0
    return RecommendationResponse(
        query=req.query, detected_language=detected_lang, translated_query=expanded_query,
        total_matches=len(recommendations), recommendations=recommendations,
        document_evidences=evidences if recommendations else [], latency_ms=round(elapsed, 2),
        message=message,
    )


