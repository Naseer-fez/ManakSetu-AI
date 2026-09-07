"""Unit tests for LiveVoiceStreamer and graceful turn completion."""
from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock
import pytest
from backend.engine.voice.live_voice_streamer import LiveVoiceStreamer
from backend.engine.voice.sentence_buffer import SentenceBuffer
from backend.engine.voice.tts_provider import SynthesisResult


async def _mock_stream(*tokens: str):
    for t in tokens:
        yield t


@pytest.mark.asyncio
async def test_live_voice_streamer_full_cycle() -> None:
    mock_llm = MagicMock()
    mock_llm.generate_text_stream = MagicMock(return_value=_mock_stream("Hello ", "world. ", "How ", "are you?"))
    mock_tts = MagicMock()
    mock_tts.synthesize_sentence = AsyncMock(return_value=SynthesisResult(audio_bytes=b"riff_wav", sample_rate=16000))
    sent_events: list[dict[str, Any]] = []

    async def mock_send(event: Any) -> None:
        sent_events.append(event.model_dump())

    buffer = SentenceBuffer(".!?")
    streamer = LiveVoiceStreamer(mock_llm, mock_tts, buffer, mock_send)

    full_text = await streamer.stream_llm_tts("Hi", language="en")
    assert "Hello world." in full_text
    chunk_events = [e for e in sent_events if e.get("event") == "llm_chunk"]
    audio_events = [e for e in sent_events if e.get("event") == "tts_audio"]
    assert len(chunk_events) >= 1
    assert len(audio_events) >= 1


@pytest.mark.asyncio
async def test_live_voice_streamer_filters_think_tags() -> None:
    mock_llm = MagicMock()
    mock_llm.generate_text_stream = MagicMock(return_value=_mock_stream("<think>", "internal thought", "</think>", "Spoken answer."))
    mock_tts = MagicMock()
    mock_tts.synthesize_sentence = AsyncMock(return_value=SynthesisResult(audio_bytes=b"audio", sample_rate=16000))
    sent_events: list[dict[str, Any]] = []

    async def mock_send(event: Any) -> None:
        sent_events.append(event.model_dump())

    buffer = SentenceBuffer(".!?")
    streamer = LiveVoiceStreamer(mock_llm, mock_tts, buffer, mock_send)

    full_text = await streamer.stream_llm_tts("Query", language="en")
    assert "Spoken answer." in full_text
    assert "internal thought" not in full_text
