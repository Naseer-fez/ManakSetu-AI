"""Pre-LLM guardrail for web search queries.

Implements a triple-layer security model:
  Layer 1 – Blocked keyword / regex pattern rejection.
  Layer 2 – Allowed keyword requirement (must contain ≥1 BIS-relevant term).
  Layer 3 – Domain-scoped query construction (site: restrictions appended).

Zero GPU cost – pure string / regex operations.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

from backend.logger.app_logger import get_logger

logger = get_logger("engine.web_search_guardrail")


@dataclass(frozen=True)
class GuardrailResult:
    """Immutable result of a guardrail evaluation."""

    approved: bool
    scoped_query: str = ""
    rejection_reason: str = ""


@dataclass
class GuardrailConfig:
    """Parsed guardrail configuration loaded from YAML."""

    allowed_domains: list[str] = field(default_factory=list)
    allowed_keywords: list[str] = field(default_factory=list)
    blocked_keywords: list[str] = field(default_factory=list)
    blocked_patterns: list[str] = field(default_factory=list)


def _load_guardrail_config(config_path: str | Path) -> GuardrailConfig:
    """Load and validate guardrail configuration from YAML file."""
    path = Path(config_path)
    if not path.exists():
        logger.warning(f"Guardrail config not found at {path}, using empty defaults")
        return GuardrailConfig()
    try:
        with open(path, "r", encoding="utf-8") as fh:
            raw: dict[str, Any] = yaml.safe_load(fh) or {}
        return GuardrailConfig(
            allowed_domains=raw.get("allowed_domains", []),
            allowed_keywords=[kw.lower() for kw in raw.get("allowed_keywords", [])],
            blocked_keywords=[kw.lower() for kw in raw.get("blocked_keywords", [])],
            blocked_patterns=raw.get("blocked_patterns", []),
        )
    except (yaml.YAMLError, OSError, ValueError) as exc:
        logger.error(f"Failed to load guardrail config ({type(exc).__name__}): {exc}")
        return GuardrailConfig()


def _compile_blocked_patterns(patterns: list[str]) -> list[re.Pattern[str]]:
    """Pre-compile regex patterns for fast matching."""
    compiled: list[re.Pattern[str]] = []
    for pat in patterns:
        try:
            compiled.append(re.compile(pat, re.IGNORECASE))
        except re.error as exc:
            logger.warning(f"Invalid blocked pattern '{pat}': {exc}")
    return compiled


class WebSearchGuardrail:
    """Validates web search queries before they reach the search API.

    Triple-layer defence:
      1. Reject queries matching blocked keywords or injection patterns.
      2. Require at least one BIS/procurement allowed keyword.
      3. Append domain-scope restrictions to the outgoing search query.
    """

    def __init__(self, config_path: str | Path) -> None:
        self._cfg = _load_guardrail_config(config_path)
        self._blocked_re = _compile_blocked_patterns(self._cfg.blocked_patterns)
        self._domain_clause = self._build_domain_clause()
        logger.info(
            f"WebSearchGuardrail initialised: "
            f"{len(self._cfg.allowed_keywords)} allowed keywords, "
            f"{len(self._cfg.blocked_keywords)} blocked keywords, "
            f"{len(self._blocked_re)} blocked patterns, "
            f"{len(self._cfg.allowed_domains)} allowed domains"
        )

    def _build_domain_clause(self) -> str:
        """Build the ``site:`` OR clause appended to every approved query."""
        if not self._cfg.allowed_domains:
            return ""
        parts = [f"site:{d}" for d in self._cfg.allowed_domains]
        return " " + " OR ".join(parts)

    def evaluate(self, query: str) -> GuardrailResult:
        """Run all three guardrail layers on *query* and return the verdict."""
        if not query or not query.strip():
            return GuardrailResult(approved=False, rejection_reason="Empty query")

        normalised = query.strip()
        lower = normalised.lower()

        # --- Layer 1: blocked keywords & patterns ---
        for bk in self._cfg.blocked_keywords:
            if bk in lower:
                reason = f"Blocked keyword detected: '{bk}'"
                logger.info(f"Guardrail REJECT – {reason}")
                return GuardrailResult(approved=False, rejection_reason=reason)

        for pat in self._blocked_re:
            if pat.search(normalised):
                reason = f"Blocked pattern detected: '{pat.pattern}'"
                logger.info(f"Guardrail REJECT – {reason}")
                return GuardrailResult(approved=False, rejection_reason=reason)

        # --- Layer 2: allowed keyword requirement ---
        has_allowed = any(ak in lower for ak in self._cfg.allowed_keywords)
        if not has_allowed:
            reason = "Query does not contain any BIS/procurement-related keyword"
            logger.info(f"Guardrail REJECT – {reason}")
            return GuardrailResult(approved=False, rejection_reason=reason)

        # --- Layer 3: domain-scoped query construction ---
        scoped = normalised + self._domain_clause
        logger.info(f"Guardrail APPROVED – scoped query length: {len(scoped)}")
        return GuardrailResult(approved=True, scoped_query=scoped)
