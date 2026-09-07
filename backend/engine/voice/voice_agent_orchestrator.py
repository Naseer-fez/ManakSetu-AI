"""Voice Agent Orchestrator pipeline coordinating STT, LLM reasoning, and TTS."""
from __future__ import annotations

import time
import uuid
from backend.config.paths import TTS_CACHE_DIR
from backend.engine.hybrid_retriever import HybridRetriever
from backend.engine.llm_orchestrator import LlmOrchestrator
from backend.engine.llm_service import get_llm_service
from backend.engine.voice.audio_utils import clean_voice_text
from backend.engine.voice.provider_factory import get_stt_provider, get_tts_provider
from backend.ingestion.standards_loader import StandardsLoader
from backend.logger.app_logger import get_logger
from backend.models.recommendation_model import DocumentChunkEvidence
from backend.models.voice_contracts import VoiceChatResponse

logger = get_logger("engine.voice.orchestrator")


class VoiceAgentOrchestrator:
    """End-to-end pipeline orchestrator for voice-driven assistant conversations."""

    def __init__(self) -> None:
        self._stt = get_stt_provider()
        self._tts = get_tts_provider()
        self._retriever = HybridRetriever()
        self._loader = StandardsLoader()
        self._llm_service = get_llm_service()
        self._llm_orchestrator = LlmOrchestrator()

    def _persist_audio(self, wav_bytes: bytes) -> str:
        """Write generated audio to cache directory and return relative endpoint URL."""
        if not wav_bytes:
            return ""
        TTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"voice_{uuid.uuid4().hex[:12]}.wav"
        out_path = TTS_CACHE_DIR / filename
        out_path.write_bytes(wav_bytes)
        return f"/api/v1/voice/audio/{filename}"

    async def _execute_llm(
        self, query: str, mode: str, pdf_text: str | None, history: list[dict[str, str]] | None
    ) -> tuple[str, list[DocumentChunkEvidence]]:
        """Dispatch query to fast or thinking LLM provider with grounding context."""
        if mode.lower() == "fast":
            resp = await self._llm_orchestrator.execute_fast_answer(query=query, pdf_text=pdf_text or "")
            return resp.answer, []

        matches, evidences = self._retriever.search_with_evidence(query=query, top_k=5, top_k_chunks=3)
        standards = [m[0] for m in matches] if matches else self._loader.get_all_standards()[:5]
        answer = await self._llm_service.answer_procurement_query(
            question=query, context_standards=standards, document_chunks=evidences,
            pdf_text=pdf_text, chat_history=history,
        )
        return answer, evidences

    async def process_voice_query(
        self, audio_bytes: bytes, chat_history: list[dict[str, str]] | None = None,
        mode: str = "thinking", language: str = "auto", pdf_text: str | None = None,
    ) -> VoiceChatResponse:
        """Execute full Voice -> STT -> LLM -> TTS -> Audio pipeline."""
        t0 = time.perf_counter()
        stt_res = await self._stt.transcribe(audio_bytes, language=language)
        transcribed = stt_res.text
        det_lang = stt_res.language if language == "auto" else language
        logger.info(f"Voice query: '{transcribed}' (lang={det_lang}, mode={mode})")

        if not transcribed.strip():
            fallback_msg = "Could not capture speech clearly. Please speak again."
            tts_res = await self._tts.synthesize(fallback_msg, language=det_lang)
            audio_url = self._persist_audio(tts_res.audio_bytes)
            return VoiceChatResponse(
                transcribed_text="", detected_language=det_lang, llm_response=fallback_msg,
                audio_url=audio_url, mode=mode, processing_time_ms=(time.perf_counter() - t0) * 1000.0,
            )

        llm_answer, evidences = await self._execute_llm(transcribed, mode, pdf_text, chat_history)
        tts_text = clean_voice_text(llm_answer)
        tts_res = await self._tts.synthesize(tts_text or llm_answer, language=det_lang)
        audio_url = self._persist_audio(tts_res.audio_bytes)
        elapsed_ms = (time.perf_counter() - t0) * 1000.0

        return VoiceChatResponse(
            transcribed_text=transcribed, detected_language=det_lang, llm_response=llm_answer,
            audio_url=audio_url, mode=mode, document_evidences=evidences, processing_time_ms=elapsed_ms,
        )
