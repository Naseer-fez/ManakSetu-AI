"""Unit and integration tests for VoiceAgentOrchestrator pipeline."""
from __future__ import annotations

from pathlib import Path
import pytest
from backend.config.paths import TTS_CACHE_DIR
from backend.engine.voice.voice_agent_orchestrator import VoiceAgentOrchestrator
from backend.models.voice_contracts import VoiceChatResponse


@pytest.mark.asyncio
async def test_orchestrator_empty_audio() -> None:
    """Empty audio returns fallback message and playable audio URL without crashing."""
    orchestrator = VoiceAgentOrchestrator()
    resp = await orchestrator.process_voice_query(audio_bytes=b"", language="en", mode="fast")

    assert isinstance(resp, VoiceChatResponse)
    assert resp.transcribed_text == ""
    assert "Could not capture" in resp.llm_response
    assert resp.audio_url.startswith("/api/v1/voice/audio/")
    # Check that the audio file was actually created on disk
    filename = resp.audio_url.split("/")[-1]
    assert (TTS_CACHE_DIR / filename).exists()


@pytest.mark.asyncio
async def test_orchestrator_persist_audio() -> None:
    """Test audio persistence helper writes valid file."""
    orchestrator = VoiceAgentOrchestrator()
    url = orchestrator._persist_audio(b"RIFFdummywavecontent1234567890")
    assert url.startswith("/api/v1/voice/audio/")
    filename = url.split("/")[-1]
    assert (TTS_CACHE_DIR / filename).exists()
