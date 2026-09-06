"""Distributed LLM Orchestrator with Mac Offloading and Local 6GB VRAM coordination."""
from __future__ import annotations
import asyncio
from typing import Any
from backend.config.settings import app_settings
from backend.engine.document_chunk_reranker import DocumentChunkReranker
from backend.engine.llm_interface import BaseLlmProvider
from backend.engine.llm_providers import (
    DeterministicFallbackProvider, GeminiLlmProvider, LocalGgufLlmProvider,
    OpenAiLlmProvider, OpenRouterLlmProvider, RemoteMacLlmProvider,
)
from backend.engine.llm_service import get_llm_provider
from backend.engine.orchestrator_helpers import (
    build_orchestrator_prompt, count_history_tokens, synthesize_contract_response,
)
from backend.engine.prompts.fast_model_prompts import (
    FAST_MODEL_CONTEXT_COMPRESSION_PROMPT,
    FAST_MODEL_DIRECT_QA_PROMPT,
    FAST_MODEL_PDF_SYNTHESIZER_PROMPT,
)
from backend.engine.prompts.thinking_model_prompts import THINKING_MODEL_DEEP_AUDITOR_PROMPT
from backend.engine.query_guardrails import QueryGuardrails
from backend.engine.web_search_guardrail import WebSearchGuardrail
from backend.engine.web_search_service import WebSearchService
from backend.logger.app_logger import get_logger
from backend.models.llm_contracts import LlmInputContract, LlmStandardizedResponse, PipelineAnswerResponse

logger = get_logger("engine.llm_orchestrator")


def _get_default_cloud_provider() -> BaseLlmProvider:
    prov = app_settings.llm.provider.lower()
    if prov in ("local", "local_gguf", "gguf"):
        return LocalGgufLlmProvider()
    if prov in ("openrouter", "open_router"):
        return OpenRouterLlmProvider()
    return GeminiLlmProvider() if prov == "gemini" else OpenAiLlmProvider()


def _safe_kwargs(method: Any, **desired: Any) -> dict[str, Any]:
    """Filter keyword arguments down to those accepted by the callable."""
    import inspect
    try:
        sig = inspect.signature(method)
        if any(p.kind == inspect.Parameter.VAR_KEYWORD for p in sig.parameters.values()):
            return desired
        return {k: v for k, v in desired.items() if k in sig.parameters}
    except (ValueError, TypeError):
        return {}


class LlmOrchestrator:
    """Orchestrates Fast Answer (Local 2B) and Heavy Reasoning (Mac Offload / Local 7B)."""

    def __init__(
        self,
        cloud: BaseLlmProvider | None = None,
        local: BaseLlmProvider | None = None,
        timeout_sec: float = 6.0,
        cloud_provider: BaseLlmProvider | None = None,
        local_provider: BaseLlmProvider | None = None,
    ) -> None:
        cp = cloud or cloud_provider
        lp = local or local_provider
        self._distributed = (
            isinstance(cp, RemoteMacLlmProvider)
            if cp is not None
            else app_settings.distributed_reasoning.mac_available
        )
        if self._distributed:
            self._cloud = cp or RemoteMacLlmProvider()
            self._local = lp or get_llm_provider("local")
        else:
            self._cloud = cp or _get_default_cloud_provider()
            self._local = lp or get_llm_provider("local")
        self._timeout_sec = getattr(app_settings.distributed_reasoning, "mac_timeout_sec", timeout_sec)
        self._fallback = DeterministicFallbackProvider()
        self._reranker = DocumentChunkReranker()
        
        # Web Search initialization
        self._ws_enabled = app_settings.web_search.enabled
        self._ws_guardrail: WebSearchGuardrail | None = None
        self._ws_service: WebSearchService | None = None
        if self._ws_enabled:
            self._ws_guardrail = WebSearchGuardrail(app_settings.web_search.guardrail_config)
            self._ws_service = WebSearchService()

    async def _try_web_search(self, query: str, tier: str) -> tuple[str, list[str]]:
        """Try to execute a web search for the query if allowed by guardrails.
        
        Returns:
            Tuple of (formatted_results_text, list_of_source_urls)
        """
        if not self._ws_enabled or not self._ws_guardrail or not self._ws_service:
            return "", []
            
        guard = self._ws_guardrail.evaluate(query)
        if not guard.approved:
            return "", []
            
        if tier == "fast":
            top_k = app_settings.web_search.fast_answer_top_k
            max_tokens = app_settings.web_search.fast_answer_max_tokens
        else:
            top_k = app_settings.web_search.heavy_reasoning_top_k
            max_tokens = app_settings.web_search.heavy_reasoning_max_tokens
            
        results = await self._ws_service.search(
            scoped_query=guard.scoped_query, top_k=top_k, max_tokens=max_tokens
        )
        if not results:
            return "", []
            
        return self._ws_service.format_for_prompt(results), [r.url for r in results]

    async def summarize_chat_history(self, chat_history: list[dict[str, str]]) -> str:
        """Compress long conversation history into a dense summary using local model."""
        if not chat_history:
            return ""
        history_text = "\n".join(f"{m.get('role', 'user').capitalize()}: {m.get('content', '')}" for m in chat_history)
        prompt = (
            "Summarize the technical and procurement specifications in this chat history into a dense, "
            f"accurate context overview:\n\n{history_text}"
        )
        kwargs = _safe_kwargs(self._local.generate_text, max_tokens=250, use_grammar=False)
        try:
            summary = await asyncio.wait_for(
                self._local.generate_text(prompt, system_prompt=FAST_MODEL_CONTEXT_COMPRESSION_PROMPT, **kwargs),
                timeout=20.0,
            )
            return summary.strip() if summary else ""
        except (asyncio.TimeoutError, RuntimeError, ValueError, OSError) as exc:
            logger.warning(f"Failed to summarize chat history ({type(exc).__name__}): {exc}")
            return history_text[-2000:]

    async def synthesize_document_context(self, query: str, document_chunks: list[dict[str, Any]]) -> str:
        """Generate a descriptive, compressed contextual prompt from retrieved chunks using local model."""
        if not document_chunks:
            return ""
        chunk_texts = "\n\n".join(str(c.get("text", "")) for c in document_chunks)
        prompt = (
            f"Query: {query}\n\nTechnical Document Chunks:\n{chunk_texts}\n\n"
            "Synthesize a focused, factual summary of the specifications relevant to the query."
        )
        kwargs = _safe_kwargs(self._local.generate_text, max_tokens=300, use_grammar=False)
        try:
            return await asyncio.wait_for(
                self._local.generate_text(prompt, system_prompt=FAST_MODEL_PDF_SYNTHESIZER_PROMPT, **kwargs),
                timeout=25.0,
            )
        except (asyncio.TimeoutError, RuntimeError, ValueError, OSError) as exc:
            logger.warning(f"Failed to synthesize document context ({type(exc).__name__}): {exc}")
            return chunk_texts[:2000]

    async def execute_fast_answer(self, query: str, pdf_text: str = "") -> PipelineAnswerResponse:
        """Feature A: Rapid response executing solely on the local model."""
        tier = "local_2b" if self._distributed else "local_7b"
        
        # 1. Check Guardrails
        fast_path = QueryGuardrails.check_fast_path(query)
        if fast_path:
            return PipelineAnswerResponse(
                query=query, answer=fast_path, source_tier="guardrail_fast_path"
            )
            
        if QueryGuardrails.check_out_of_context(query):
            return PipelineAnswerResponse(
                query=query, answer="I am the BIS assistant. I only answer questions related to Indian Standards and procurement.", source_tier="guardrail_rejection"
            )

        prompt = f"User Query: {query}"
        
        ws_text, ws_sources = await self._try_web_search(query, "fast")
        if ws_text:
            prompt += f"\n\n{ws_text}"
            
        if pdf_text.strip():
            # Support RAG for Fast Models
            chunks = self._reranker.retrieve_and_rerank_chunks(query, pdf_text, top_k=3)
            chunk_texts = "\n\n".join(str(c.get("text", "")) for c in chunks)
            if chunk_texts:
                prompt += f"\n\nDocument Context:\n{chunk_texts}"
            else:
                prompt += f"\n\nDocument Context:\n{pdf_text[:2000]}"
        prompt += "\n\nProvide a rapid, precise answer on Indian Standards compliance and requirements."
        kwargs = _safe_kwargs(self._local.generate_text, max_tokens=256, use_grammar=False)
        try:
            raw = await asyncio.wait_for(
                self._local.generate_text(
                    prompt,
                    system_prompt=FAST_MODEL_DIRECT_QA_PROMPT,
                    **kwargs,
                ),
                timeout=15.0,
            )
            if raw and len(raw.strip()) > 5:
                return PipelineAnswerResponse(
                    query=query, 
                    answer=raw.strip(), 
                    source_tier=tier,
                    web_search_used=bool(ws_sources),
                    web_sources=ws_sources
                )
        except (asyncio.TimeoutError, RuntimeError, ValueError, OSError) as exc:
            logger.warning(f"Fast Answer local inference failed ({type(exc).__name__}): {exc}")
        return PipelineAnswerResponse(
            query=query, answer="No local LLM available for fast answer generation.", source_tier="unavailable", confidence_score=0.0
        )

    async def execute_heavy_reasoning(
        self, query: str, pdf_text: str = "", chat_history: list[dict[str, str]] | None = None, refresh_context: bool = False
    ) -> PipelineAnswerResponse:
        """Feature B & C: Heavy reasoning pipeline with optional Mac offloading and context synthesis."""
        # 1. Check Guardrails
        fast_path = QueryGuardrails.check_fast_path(query)
        if fast_path:
            return PipelineAnswerResponse(
                query=query, answer=fast_path, source_tier="guardrail_fast_path"
            )
            
        if QueryGuardrails.check_out_of_context(query):
            return PipelineAnswerResponse(
                query=query, answer="I am the BIS assistant. I only answer questions related to Indian Standards and procurement.", source_tier="guardrail_rejection"
            )

        history_summary = ""
        if chat_history:
            if refresh_context or count_history_tokens(chat_history) > 24000:
                history_summary = await self.summarize_chat_history(chat_history)

        synthesized_context = ""
        if pdf_text.strip():
            chunks = self._reranker.retrieve_and_rerank_chunks(query, pdf_text, top_k=5)
            synthesized_context = await self.synthesize_document_context(query, chunks)

        ws_text, ws_sources = await self._try_web_search(query, "heavy")

        mac_prompt = f"User Query: {query}\n"
        if history_summary:
            mac_prompt += f"\n[Conversation History Summary]:\n{history_summary}\n"
        elif chat_history:
            raw_history = "\n".join(f"{m.get('role', 'user').capitalize()}: {m.get('content', '')}" for m in chat_history)
            mac_prompt += f"\n[Conversation History]:\n{raw_history}\n"
        if synthesized_context:
            mac_prompt += f"\n[Synthesized Specification Context]:\n{synthesized_context}\n"
        if ws_text:
            mac_prompt += f"\n{ws_text}\n"
        mac_prompt += "\nPerform exhaustive technical reasoning, QCO compliance checking, and IS verification."

        if self._distributed:
            try:
                raw = await asyncio.wait_for(
                    self._cloud.generate_text(mac_prompt, system_prompt=THINKING_MODEL_DEEP_AUDITOR_PROMPT),
                    timeout=self._timeout_sec,
                )
                if raw and len(raw.strip()) > 10:
                    return PipelineAnswerResponse(
                        query=query, answer=raw.strip(), source_tier="remote_mac",
                        synthesized_context=synthesized_context, summarized_history=history_summary,
                        web_search_used=bool(ws_sources), web_sources=ws_sources
                    )
            except (asyncio.TimeoutError, OSError, ValueError) as exc:
                logger.warning(f"Remote Mac reasoning unavailable ({type(exc).__name__}) -> Local fallback")

        try:
            raw = await self._local.generate_text(mac_prompt, system_prompt=THINKING_MODEL_DEEP_AUDITOR_PROMPT)
            if raw and len(raw.strip()) > 10:
                return PipelineAnswerResponse(
                    query=query, answer=raw.strip(), source_tier="local_2b_fallback" if self._distributed else "local_7b",
                    synthesized_context=synthesized_context, summarized_history=history_summary,
                    web_search_used=bool(ws_sources), web_sources=ws_sources
                )
        except (RuntimeError, ValueError, OSError) as exc:
            logger.warning(f"Local reasoning failed ({type(exc).__name__}): {exc}")

        return PipelineAnswerResponse(
            query=query, answer="No AI model is currently active to perform heavy reasoning.", source_tier="unavailable", confidence_score=0.0
        )

    async def execute(self, contract: LlmInputContract) -> LlmStandardizedResponse:
        """Legacy / Standard execution entry point."""
        # 1. Check Guardrails
        fast_path = QueryGuardrails.check_fast_path(contract.query)
        if fast_path:
            return synthesize_contract_response(contract, fast_path, "guardrail_fast_path")
            
        if QueryGuardrails.check_out_of_context(contract.query):
            return synthesize_contract_response(contract, "I am the BIS assistant. I only answer questions related to Indian Standards and procurement.", "guardrail_rejection")

        if getattr(self, "_distributed", False) and contract.document_chunks:
            synth = await self.synthesize_document_context(contract.query, contract.document_chunks)
            contract.document_chunks = [{"text": synth, "file_name": "Synthesized Context", "page_number": 1}]

        sys_p, user_p = build_orchestrator_prompt(contract)
        try:
            raw = await asyncio.wait_for(self._cloud.generate_text(user_p, sys_p), timeout=self._timeout_sec)
            if raw and len(raw.strip()) > 20:
                return synthesize_contract_response(contract, raw, "remote_mac" if self._distributed else "cloud")
        except (asyncio.TimeoutError, OSError, ValueError) as exc:
            logger.warning(f"Primary LLM unavailable ({type(exc).__name__}) -> Local/Fallback Tier")

        if not getattr(self, "_distributed", False):
            try:
                raw = await self._local.generate_text(user_p, sys_p)
                if raw and len(raw.strip()) > 20:
                    return synthesize_contract_response(contract, raw, "local_fallback")
            except (RuntimeError, OSError, ValueError) as exc:
                logger.warning(f"Local GGUF unavailable ({type(exc).__name__}) -> Deterministic")

        top_s = contract.candidate_standards[0] if contract.candidate_standards else None
        return LlmStandardizedResponse(
            query=contract.query, primary_is_code=top_s.is_code if top_s else "IS General",
            primary_title=top_s.title if top_s else "Indian Standard",
            technical_justification="No LLM model is currently available (Cloud API not configured and Local AI runtime offline).",
            qco_compliance_verdict="Unavailable: No active LLM model to perform AI justification.",
            mandatory_test_methods=top_s.test_methods if top_s else [],
            allied_standards_summary=[f"{r} (Normative Reference)" for r in top_s.normative_references] if top_s else [],
            cited_clauses=[f"{k.get('file_name', 'Doc')} (Page {k.get('page_number', 1)})" for k in contract.document_chunks[:3]],
            confidence_score=0.0, source_tier="unavailable",
        )
