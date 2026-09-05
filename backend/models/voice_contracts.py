"""Pydantic schemas and contract models for Voice Agent I/O."""
from __future__ import annotations

from pydantic import BaseModel, Field
from backend.models.recommendation_model import DocumentChunkEvidence


class VoiceChatMessage(BaseModel):
    """Message item in voice chat conversation history."""
    role: str
    content: str
    audio_url: str | None = None
    language: str | None = None


class VoiceChatResponse(BaseModel):
    """Unified response payload for voice-to-LLM-to-speech chat pipeline."""
    transcribed_text: str
    detected_language: str
    llm_response: str
    audio_url: str
    mode: str = "thinking"
    document_evidences: list[DocumentChunkEvidence] = Field(default_factory=list)
    processing_time_ms: float = 0.0


class VoiceStatusResponse(BaseModel):
    """Runtime health and configuration status of voice subsystem."""
    stt_available: bool
    stt_provider: str
    tts_available: bool
    tts_provider: str
    stt_device: str
    tts_device: str
    default_language: str
