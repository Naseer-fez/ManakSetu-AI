"""FastAPI router for Voice Agent Chat and subsystem health status."""
from __future__ import annotations

import json
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from backend.config.settings import app_settings
from backend.engine.voice.provider_factory import get_stt_provider, get_tts_provider
from backend.engine.voice.voice_agent_orchestrator import VoiceAgentOrchestrator
from backend.logger.app_logger import get_logger
from backend.models.voice_contracts import VoiceChatResponse, VoiceStatusResponse

logger = get_logger("api.voice_agent_router")
router = APIRouter(prefix="/api/v1/voice", tags=["voice_agent"])
orchestrator = VoiceAgentOrchestrator()


@router.post("/chat", response_model=VoiceChatResponse)
async def voice_chat_endpoint(
    audio_file: UploadFile = File(...),
    chat_history: str = Form("[]"),
    mode: str = Form("thinking"),
    language: str = Form("auto"),
    pdf_text: str | None = Form(None),
) -> VoiceChatResponse:
    """Unified Voice-to-LLM-to-Speech chat endpoint with bilingual support."""
    try:
        audio_bytes = await audio_file.read()
        parsed_history: list[dict[str, str]] = []
        if chat_history:
            try:
                parsed = json.loads(chat_history)
                if isinstance(parsed, list):
                    parsed_history = parsed
            except (json.JSONDecodeError, TypeError):
                parsed_history = []

        return await orchestrator.process_voice_query(
            audio_bytes=audio_bytes,
            chat_history=parsed_history,
            mode=mode,
            language=language,
            pdf_text=pdf_text,
        )
    except (RuntimeError, OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
        logger.error(f"Error in voice_chat_endpoint ({type(exc).__name__}): {exc}")
        raise HTTPException(status_code=500, detail=f"Voice pipeline error: {type(exc).__name__}")


@router.get("/status", response_model=VoiceStatusResponse)
async def voice_status_endpoint() -> VoiceStatusResponse:
    """Get active voice subsystem configuration, provider names, and availability."""
    stt = get_stt_provider()
    tts = get_tts_provider()
    cfg = app_settings.voice

    return VoiceStatusResponse(
        stt_available=stt.is_available(),
        stt_provider=stt.provider_name(),
        tts_available=tts.is_available(),
        tts_provider=tts.provider_name(),
        stt_device=cfg.stt_device,
        tts_device=cfg.tts_device,
        default_language=cfg.default_language,
    )
