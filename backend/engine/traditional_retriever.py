"""Traditional purely semantic retriever for Indian Standards backed by ChromaDB."""
from __future__ import annotations
import re
from backend.engine.chroma_hydrator import hydrate_standard_from_chroma
from backend.ingestion.standards_loader import StandardsLoader
from backend.logger.app_logger import get_logger
from backend.models.recommendation_model import DocumentChunkEvidence
from backend.models.standard_model import IndianStandard
from backend.vectordb.search_service import VectorDbSearchService

logger = get_logger("engine.traditional_retriever")


class TraditionalRetriever:
    """Traditional embedded searching using dense vectors and returning percentage values."""

    def __init__(self, loader: StandardsLoader | None = None) -> None:
        self._loader = loader or StandardsLoader()
        self._vectordb = VectorDbSearchService()

    def search(
        self,
        query: str,
        division: str | None = None,
        top_k: int = 5,
        min_relevance_score: float | None = None,
    ) -> list[tuple[IndianStandard, float, list[str]]]:
        """Perform Stage 1: Macro Standard Discovery using simple vector search."""
        if not query.strip():
            return []

        logger.info(f"TraditionalRetriever: Macro search for '{query}' (Division: {division or 'All'})")

        results: list[tuple[IndianStandard, float, list[str]]] = []
        try:
            hits = self._vectordb.search(query=query, division=division, top_k=top_k)
            for hit in hits:
                std = hydrate_standard_from_chroma(hit, self._loader)
                # Ensure dense_score is between 0.0 and 1.0 (similarity_score is already structured like that in search_service)
                dense_score = float(hit.get("similarity_score", 0.0))
                
                if min_relevance_score is not None and min_relevance_score > 0.0:
                    if dense_score < min_relevance_score:
                        continue
                        
                results.append((std, dense_score, [f"Traditional Vector Match ({dense_score * 100:.2f}%)"]))
        except Exception as exc:
            logger.error(f"ChromaDB search error in TraditionalRetriever: {exc}")

        # Sort by score descending
        results.sort(key=lambda item: item[1], reverse=True)
        return results

    def search_document_evidence(self, query: str, top_k: int = 5) -> list[DocumentChunkEvidence]:
        """Perform Stage 2: Micro Evidence & Deep Clause Retrieval from PDF chunks."""
        raw_chunks = self._vectordb.search_document_chunks(query=query, top_k=top_k)
        evidences: list[DocumentChunkEvidence] = []
        for c in raw_chunks:
            evidences.append(DocumentChunkEvidence(
                chunk_id=c.get("chunk_id", ""), doc_id=c.get("doc_id", ""),
                file_name=c.get("file_name", ""), page_number=c.get("page_number", 1),
                total_pages=c.get("total_pages", 1), folder_category=c.get("folder_category", "Standard"),
                snippet=c.get("snippet", ""), relevance_score=c.get("similarity_score", 0.0),
            ))
        return evidences

    def search_with_evidence(
        self,
        query: str,
        division: str | None = None,
        top_k: int = 5,
        top_k_chunks: int = 5,
        min_relevance_score: float | None = None,
    ) -> tuple[list[tuple[IndianStandard, float, list[str]]], list[DocumentChunkEvidence]]:
        """Perform unified Dual-Index Retrieval unifying macro standards and micro PDF clause excerpts."""
        standards = self.search(
            query=query, division=division, top_k=top_k, min_relevance_score=min_relevance_score
        )
        if not standards:
            return [], []
        evidences = self.search_document_evidence(query=query, top_k=top_k_chunks)
        codes = [s[0].is_code for s in standards]
        for ev in evidences:
            for c in codes:
                code_digits = re.sub(r"[^\d]", "", c)
                if code_digits and (c.lower() in ev.file_name.lower() or code_digits in ev.file_name.lower() or c.lower() in ev.snippet.lower()):
                    ev.matched_standard = c
                    break
        return standards, evidences
