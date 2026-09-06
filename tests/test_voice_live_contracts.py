"""Tests for Live Voice WebSocket event contract models."""
from __future__ import annotations

import pytest
from backend.models.voice_live_contracts import (
    ErrorEvent,
    LiveVoiceClientConfig,
    LlmChunkEvent,
    ResponseCompleteEvent,
    SessionStatusEvent,
    SttFinalEvent,
    SttPartialEvent,
    TtsAudioEvent,
)


def test_stt_partial_event() -> None:
    event = SttPartialEvent(text="hello")
    data = event.model_dump()
    assert data["event"] == "stt_partial"
    assert data["text"] == "hello"
    roundtrip = SttPartialEvent.model_validate(data)
    assert roundtrip == event


def test_stt_final_event() -> None:
    event = SttFinalEvent(text="Hello world", language="en", confidence=0.95)
    data = event.model_dump()
    assert data["event"] == "stt_final"
    assert data["confidence"] == 0.95
    roundtrip = SttFinalEvent.model_validate(data)
    assert roundtrip == event


def test_stt_final_event_defaults() -> None:
    event = SttFinalEvent(text="test", language="hi")
    assert event.confidence is None
    assert event.duration_sec == 0.0


def test_llm_chunk_event() -> None:
    event = LlmChunkEvent(text="IS 1893 covers seismic design.", chunk_index=2)
    data = event.model_dump()
    assert data["event"] == "llm_chunk"
    assert data["chunk_index"] == 2


def test_tts_audio_event() -> None:
    event = TtsAudioEvent(data="base64data", sample_rate=22050, chunk_index=1)
    data = event.model_dump()
    assert data["event"] == "tts_audio"
    assert data["sample_rate"] == 22050


def test_response_complete_event() -> None:
    event = ResponseCompleteEvent(full_text="Complete response.", turn_index=3, processing_time_ms=1234.5)
    data = event.model_dump()
    assert data["event"] == "response_complete"
    assert data["turn_index"] == 3


def test_error_event() -> None:
    event = ErrorEvent(message="STT failed", component="stt", recoverable=True)
    data = event.model_dump()
    assert data["event"] == "error"
    assert data["recoverable"] is True


def test_error_event_defaults() -> None:
    event = ErrorEvent(message="fail", component="llm")
    assert event.recoverable is True


def test_session_status_event() -> None:
    event = SessionStatusEvent(status="ready", stt_available=True, tts_available=False)
    data = event.model_dump()
    assert data["event"] == "session_status"
    assert data["tts_available"] is False


def test_client_config_defaults() -> None:
    cfg = LiveVoiceClientConfig()
    assert cfg.sample_rate == 16000
    assert cfg.language == "auto"
    assert cfg.mode == "fast"


def test_client_config_custom() -> None:
    cfg = LiveVoiceClientConfig(sample_rate=44100, language="hi", mode="thinking")
    assert cfg.sample_rate == 44100
