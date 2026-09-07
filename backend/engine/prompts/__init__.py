"""Production-grade prompt assets and formatters for BIS-SpecAI."""
from __future__ import annotations

from backend.config.llm_config import LLM_PROMPTS
from backend.engine.prompts.prompt_formatter import (
    NOT_PROVIDED,
    build_prompt_context,
    format_chunk_excerpts,
    format_evaluation_prompt,
    format_image_context,
    format_tender_clause_prompt,
    format_testing_matrix_prompt,
)

# Mac server prompt remains in its own file as per user request ("except the Mac folder").
from backend.engine.prompts.mac_server_prompt import MAC_SERVER_MASTER_PERSONA_PROMPT

__all__ = [
    "MAC_SERVER_MASTER_PERSONA_PROMPT",
    "NOT_PROVIDED",
    "build_prompt_context",
    "format_chunk_excerpts",
    "format_image_context",
    "format_evaluation_prompt",
    "format_testing_matrix_prompt",
    "format_tender_clause_prompt",
]
