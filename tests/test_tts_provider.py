"""Unit tests for TTS Provider interface and MmsVitsTTS implementation."""
from __future__ import annotations

import io
import wave
import pytest
from backend.config.settings import VoiceSettings
from backend.engine.voice.mms_vits_tts import MmsVitsTTS
from backend.engine.voice.tts_provider import SynthesisResult, TextToSpeechProvider


def test_tts_provider_interface() -> None:
    """Validate that MmsVitsTTS implements TextToSpeechProvider ABC."""
    provider = MmsVitsTTS()
    assert isinstance(provider, TextToSpeechProvider)
    assert "MmsVitsTTS" in provider.provider_name()
    assert isinstance(provider.is_available(), bool)


@pytest.mark.asyncio
async def test_mms_vits_tts_synthesize_english() -> None:
    """Test English speech synthesis generates valid WAV audio bytes."""
    provider = MmsVitsTTS()
    result = await provider.synthesize("Mandatory BIS standard for steel", language="en")
    assert isinstance(result, SynthesisResult)
    assert isinstance(result.audio_bytes, bytes)
    assert len(result.audio_bytes) > 100
    with io.BytesIO(result.audio_bytes) as bio:
        with wave.open(bio, "rb") as wf:
            assert wf.getnchannels() in (1, 2)
            assert wf.getframerate() in (16000, 22050, 24000)
            assert wf.getnframes() > 0


@pytest.mark.asyncio
async def test_mms_vits_tts_synthesize_hindi() -> None:
    """Test Hindi speech synthesis generates valid audio data."""
    provider = MmsVitsTTS()
    result = await provider.synthesize("भारतीय मानक ब्यूरो गुणवत्ता नियंत्रण", language="hi")
    assert isinstance(result, SynthesisResult)
    assert len(result.audio_bytes) > 100
