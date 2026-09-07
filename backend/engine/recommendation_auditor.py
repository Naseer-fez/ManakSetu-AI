"""LLM-based recommendation auditor for verifying candidate Indian Standards."""
from __future__ import annotations

import asyncio
import json
import re
from backend.engine.llm_interface import BaseLlmProvider
from backend.engine.llm_service import get_llm_provider
from backend.logger.app_logger import get_logger
from backend.models.standard_model import IndianStandard

logger = get_logger("engine.recommendation_auditor")
_CandidateTuple = tuple[IndianStandard, float, list[str]]


def _parse_audits(raw: str) -> dict[str, tuple[bool, str]]:
    clean = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    clean = re.sub(r"\s*```$", "", clean.strip(), flags=re.MULTILINE).strip()
    s_idx, e_idx = clean.find("["), clean.rfind("]")
    if s_idx == -1 or e_idx == -1:
        return {}
    try:
        items = json.loads(clean[s_idx : e_idx + 1])
        return {
            re.sub(r"[^\w]", "", str(it.get("is_code", ""))).lower(): (
                bool(it.get("is_relevant") or it.get("is_relevance")),
                str(it.get("reason", "")).strip(),
            )
            for it in (items if isinstance(items, list) else [])
            if isinstance(it, dict)
        }
    except Exception:
        return {}


class RecommendationAuditor:
    """Uses local GPU-accelerated LLM to dynamically audit candidate recommendations."""

    def __init__(self, provider: BaseLlmProvider | None = None) -> None:
        self._provider = provider

    def _get_provider(self) -> BaseLlmProvider:
        if self._provider is None:
            self._provider = get_llm_provider("local")
        return self._provider

    def _build_prompt(self, query: str, candidates: list[_CandidateTuple]) -> str:
        candidates_str = "\n".join(
            f'{i}. code: "{std.is_code}", title: "{std.title}", scope: "{std.scope[:220]}", initial_score: "{sc*100:.1f}%"'
            for i, (std, sc, _) in enumerate(candidates, start=1)
        )
        return (
            f'Procurement Query: "{query}"\nCandidates retrieved:\n{candidates_str}\n\n'
            "Task: Audit whether each candidate is genuinely applicable. Natural language phrasing or low initial "
            "score must not disqualify a standard if scope aligns. Reject unrelated items.\n"
            'Output strictly a JSON array: [{"is_code": "...", "is_relevant": true, "reason": "..."}]'
        )

    async def audit_candidates(
        self, query: str, candidates: list[_CandidateTuple], timeout_sec: float = 12.0
    ) -> list[_CandidateTuple]:
        """Audit candidate standards with LLM, filtering out irrelevant noise."""
        if not candidates:
            return []
        try:
            raw = await asyncio.wait_for(
                self._get_provider().generate_text(
                    self._build_prompt(query, candidates),
                    system_prompt="You are an authoritative BIS procurement auditor. Output strictly JSON.",
                ),
                timeout=timeout_sec,
            )
            audit_map = _parse_audits(raw)
        except Exception as exc:
            logger.warning(f"RecommendationAuditor fallback on {type(exc).__name__}: {exc}")
            return [c for c in candidates if c[1] >= 0.35]

        audited: list[_CandidateTuple] = []
        for std, score, reasons in candidates:
            norm_c = re.sub(r"[^\w]", "", std.is_code).lower()
            d_c = re.sub(r"[^\d]", "", std.is_code.split(":")[0])
            match = next(
                (v for k, v in audit_map.items() if k in norm_c or norm_c in k or (d_c and d_c == re.sub(r"[^\d]", "", k.split(":")[0]))),
                None,
            )
            if match and match[0]:
                audited.append((std, score, reasons + [f"LLM Audit: {match[1] or 'Verified relevant'}"]))
            elif not match and score >= 0.50:
                audited.append((std, score, reasons))
        audited.sort(key=lambda x: x[1], reverse=True)
        return audited[:5]
