"""Production-grade prompt assets and formatters for BIS-SpecAI."""
from __future__ import annotations

from backend.engine.prompts.evaluation_prompt import EVALUATION_PROMPT_TEMPLATE
from backend.engine.prompts.prompt_formatter import (
    NOT_PROVIDED,
    build_prompt_context,
    format_chunk_excerpts,
    format_evaluation_prompt,
    format_image_context,
    format_tender_clause_prompt,
    format_testing_matrix_prompt,
)
from backend.engine.prompts.system_prompt import (
    MASTER_SYSTEM_PROMPT,
    WEB_SEARCH_TOOL_INSTRUCTION,
    build_system_prompt_with_tools,
)
from backend.engine.prompts.fast_model_prompts import (
    FAST_MODEL_CONTEXT_COMPRESSION_PROMPT,
    FAST_MODEL_DIRECT_QA_PROMPT,
    FAST_MODEL_PDF_SYNTHESIZER_PROMPT,
)
from backend.engine.prompts.mac_server_prompt import MAC_SERVER_MASTER_PERSONA_PROMPT
from backend.engine.prompts.tender_clause_prompt import TENDER_CLAUSE_PROMPT_TEMPLATE
from backend.engine.prompts.testing_matrix_prompt import TESTING_MATRIX_PROMPT_TEMPLATE
from backend.engine.prompts.thinking_model_prompts import THINKING_MODEL_DEEP_AUDITOR_PROMPT

__all__ = [
    "MASTER_SYSTEM_PROMPT",
    "WEB_SEARCH_TOOL_INSTRUCTION",
    "build_system_prompt_with_tools",
    "EVALUATION_PROMPT_TEMPLATE",
    "TESTING_MATRIX_PROMPT_TEMPLATE",
    "TENDER_CLAUSE_PROMPT_TEMPLATE",
    "FAST_MODEL_DIRECT_QA_PROMPT",
    "FAST_MODEL_CONTEXT_COMPRESSION_PROMPT",
    "FAST_MODEL_PDF_SYNTHESIZER_PROMPT",
    "THINKING_MODEL_DEEP_AUDITOR_PROMPT",
    "MAC_SERVER_MASTER_PERSONA_PROMPT",
    "NOT_PROVIDED",
    "build_prompt_context",
    "format_chunk_excerpts",
    "format_image_context",
    "format_evaluation_prompt",
    "format_testing_matrix_prompt",
    "format_tender_clause_prompt",
]

