"""Pydantic schemas for Live Voice WebSocket event contracts."""
from __future__ import annotations

from typing import Literal
from pydantic import BaseModel


class LiveVoiceClientConfig(BaseModel):
    """Client configuration sent on WebSocket connection start."""
    sample_rate: int = 16000
    language: str = "auto"
    mode: str = "fast"


class SttPartialEvent(BaseModel):
    """Partial speech-to-text transcription result."""
    event: Literal["stt_partial"] = "stt_partial"
    text: str
    language: str = "en"


class SttFinalEvent(BaseModel):
    """Final speech-to-text transcription result for a complete utterance."""
    event: Literal["stt_final"] = "stt_final"
    text: str
    language: str
    confidence: float | None = None
    duration_sec: float = 0.0


class LlmChunkEvent(BaseModel):
    """A sentence-level chunk of the LLM response."""
    event: Literal["llm_chunk"] = "llm_chunk"
    text: str
    chunk_index: int = 0


class TtsAudioEvent(BaseModel):
    """Base64-encoded TTS audio chunk for a synthesized sentence."""
    event: Literal["tts_audio"] = "tts_audio"
    data: str
    sample_rate: int = 16000
    chunk_index: int = 0


class ResponseCompleteEvent(BaseModel):
    """Signals that the full response cycle is complete."""
    event: Literal["response_complete"] = "response_complete"
    full_text: str
    turn_index: int = 0
    processing_time_ms: float = 0.0


class ErrorEvent(BaseModel):
    """Error event for graceful degradation."""
    event: Literal["error"] = "error"
    message: str
    component: str
    recoverable: bool = True


class SessionStatusEvent(BaseModel):
    """Session lifecycle status event."""
    event: Literal["session_status"] = "session_status"
    status: str
    stt_available: bool = True
    tts_available: bool = True
    llm_available: bool = True
