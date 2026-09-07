"""Router retriever that selects between Semantic and Traditional retrieval based on settings."""
from __future__ import annotations
from backend.config.settings import app_settings
from backend.engine.embedding_service import EmbeddingService
from backend.ingestion.standards_loader import StandardsLoader
from backend.models.recommendation_model import DocumentChunkEvidence
from backend.models.standard_model import IndianStandard
from backend.engine.semantic_retriever import SemanticRetriever
from backend.engine.traditional_retriever import TraditionalRetriever
from backend.logger.app_logger import get_logger

logger = get_logger("engine.hybrid_retriever")

class HybridRetriever:
    """Delegates search to either Traditional or Semantic retriever depending on config."""
    def __init__(self, loader: StandardsLoader | None = None, embed_svc: EmbeddingService | None = None) -> None:
        traditional = getattr(app_settings.ai_engine, "traditional", False)
        if traditional:
            logger.info("Initializing TraditionalRetriever for search operations.")
            self._impl = TraditionalRetriever(loader=loader)
        else:
            logger.info("Initializing SemanticRetriever for search operations.")
            self._impl = SemanticRetriever(loader=loader, embed_svc=embed_svc)

    def search(
        self,
        query: str,
        division: str | None = None,
        top_k: int = 5,
        min_relevance_score: float | None = None,
    ) -> list[tuple[IndianStandard, float, list[str]]]:
        return self._impl.search(query, division, top_k, min_relevance_score)

    def search_document_evidence(self, query: str, top_k: int = 5) -> list[DocumentChunkEvidence]:
        return self._impl.search_document_evidence(query, top_k)

    def search_with_evidence(
        self,
        query: str,
        division: str | None = None,
        top_k: int = 5,
        top_k_chunks: int = 5,
        min_relevance_score: float | None = None,
    ) -> tuple[list[tuple[IndianStandard, float, list[str]]], list[DocumentChunkEvidence]]:
        return self._impl.search_with_evidence(query, division, top_k, top_k_chunks, min_relevance_score)
