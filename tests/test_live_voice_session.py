"""Integration tests for LiveVoiceSession with mocked providers."""
from __future__ import annotations

import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from backend.engine.voice.stt_provider import TranscriptionResult
from backend.engine.voice.tts_provider import SynthesisResult


def _make_mock_ws() -> AsyncMock:
    """Create a mock WebSocket with receive/send_json/accept methods."""
    ws = AsyncMock()
    ws.send_json = AsyncMock()
    ws.accept = AsyncMock()
    return ws


def _make_mock_stt(text: str = "test query", language: str = "en") -> MagicMock:
    stt = MagicMock()
    stt.is_available.return_value = True
    stt.transcribe = AsyncMock(return_value=TranscriptionResult(text=text, language=language, duration_sec=0.5, confidence=0.9))
    return stt


def _make_mock_tts() -> MagicMock:
    tts = MagicMock()
    tts.is_available.return_value = True
    tts.synthesize = AsyncMock(return_value=SynthesisResult(audio_bytes=b"fake_wav", sample_rate=16000))
    tts.synthesize_sentence = AsyncMock(return_value=SynthesisResult(audio_bytes=b"fake_wav", sample_rate=16000))
    return tts


async def _make_mock_llm_stream(*tokens: str):
    """Create an async generator that yields tokens."""
    for t in tokens:
        yield t


@pytest.mark.asyncio
async def test_session_sends_ready_status() -> None:
    ws = _make_mock_ws()
    ws.receive = AsyncMock(side_effect=[{"type": "websocket.disconnect"}])
    with patch("backend.engine.voice.live_voice_session.get_stt_provider", return_value=_make_mock_stt()), \
         patch("backend.engine.voice.live_voice_session.get_tts_provider", return_value=_make_mock_tts()), \
         patch("backend.engine.voice.live_voice_session.get_llm_provider") as mock_llm_factory:
        mock_llm = MagicMock()
        mock_llm.is_loaded.return_value = True
        mock_llm_factory.return_value = mock_llm
        from backend.engine.voice.live_voice_session import LiveVoiceSession
        session = LiveVoiceSession(ws)
        await session.run()
    first_call = ws.send_json.call_args_list[0]
    event_data = first_call[0][0]
    assert event_data["event"] == "session_status"
    assert event_data["status"] == "ready"


@pytest.mark.asyncio
async def test_audio_triggers_stt() -> None:
    ws = _make_mock_ws()
    mock_stt = _make_mock_stt("hello world")
    mock_tts = _make_mock_tts()
    mock_llm = MagicMock()
    mock_llm.is_loaded.return_value = True
    mock_llm.generate_text_stream = MagicMock(return_value=_make_mock_llm_stream("Response."))
    ws.receive = AsyncMock(side_effect=[
        {"type": "websocket.receive", "bytes": b"fake_audio"},
        {"type": "websocket.disconnect"},
    ])
    with patch("backend.engine.voice.live_voice_session.get_stt_provider", return_value=mock_stt), \
         patch("backend.engine.voice.live_voice_session.get_tts_provider", return_value=mock_tts), \
         patch("backend.engine.voice.live_voice_session.get_llm_provider", return_value=mock_llm):
        from backend.engine.voice.live_voice_session import LiveVoiceSession
        session = LiveVoiceSession(ws)
        await session.run()
    mock_stt.transcribe.assert_called_once_with(b"fake_audio")


@pytest.mark.asyncio  
async def test_stt_failure_sends_error_event() -> None:
    ws = _make_mock_ws()
    mock_stt = MagicMock()
    mock_stt.is_available.return_value = True
    mock_stt.transcribe = AsyncMock(side_effect=RuntimeError("STT crashed"))
    mock_llm = MagicMock()
    mock_llm.is_loaded.return_value = True
    ws.receive = AsyncMock(side_effect=[
        {"type": "websocket.receive", "bytes": b"audio"},
        {"type": "websocket.disconnect"},
    ])
    with patch("backend.engine.voice.live_voice_session.get_stt_provider", return_value=mock_stt), \
         patch("backend.engine.voice.live_voice_session.get_tts_provider", return_value=_make_mock_tts()), \
         patch("backend.engine.voice.live_voice_session.get_llm_provider", return_value=mock_llm):
        from backend.engine.voice.live_voice_session import LiveVoiceSession
        session = LiveVoiceSession(ws)
        await session.run()
    error_calls = [c for c in ws.send_json.call_args_list if c[0][0].get("event") == "error"]
    assert len(error_calls) >= 1
    assert error_calls[0][0][0]["component"] == "stt"
