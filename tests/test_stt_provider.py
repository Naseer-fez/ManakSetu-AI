"""Unit tests for STT Provider interface and FasterWhisperSTT implementation."""
from __future__ import annotations

import pytest
from backend.config.settings import VoiceSettings
from backend.engine.voice.faster_whisper_stt import FasterWhisperSTT
from backend.engine.voice.stt_provider import SpeechToTextProvider, TranscriptionResult


def test_stt_provider_interface() -> None:
    """Validate that FasterWhisperSTT implements SpeechToTextProvider ABC."""
    provider = FasterWhisperSTT()
    assert isinstance(provider, SpeechToTextProvider)
    assert "FasterWhisperSTT" in provider.provider_name()
    assert isinstance(provider.is_available(), bool)


@pytest.mark.asyncio
async def test_faster_whisper_stt_transcribe_empty() -> None:
    """Empty audio should return empty TranscriptionResult immediately without error."""
    provider = FasterWhisperSTT()
    result = await provider.transcribe(b"", language="en")
    assert isinstance(result, TranscriptionResult)
    assert result.text == ""
    assert result.language == "en"


@pytest.mark.asyncio
async def test_faster_whisper_stt_custom_settings() -> None:
    """Test instantiating provider with custom settings."""
    custom_cfg = VoiceSettings(stt_provider="faster_whisper", stt_device="cpu", stt_compute_type="int8")
    provider = FasterWhisperSTT(settings=custom_cfg)
    assert "FasterWhisperSTT" in provider.provider_name()
