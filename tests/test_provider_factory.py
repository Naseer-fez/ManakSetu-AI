"""Unit tests for VoiceProviderFactory provider dispatch and lifecycle."""
from __future__ import annotations

import pytest
from backend.config.settings import VoiceSettings
from backend.engine.voice.faster_whisper_stt import FasterWhisperSTT
from backend.engine.voice.mms_vits_tts import MmsVitsTTS
from backend.engine.voice.provider_factory import (
    get_stt_provider,
    get_tts_provider,
    reset_voice_singletons,
)


def test_factory_get_stt_provider() -> None:
    """Test factory resolves faster_whisper to FasterWhisperSTT singleton."""
    reset_voice_singletons()
    provider1 = get_stt_provider()
    provider2 = get_stt_provider()
    assert isinstance(provider1, FasterWhisperSTT)
    assert provider1 is provider2


def test_factory_get_tts_provider() -> None:
    """Test factory resolves mms_vits to MmsVitsTTS singleton."""
    reset_voice_singletons()
    provider1 = get_tts_provider()
    provider2 = get_tts_provider()
    assert isinstance(provider1, MmsVitsTTS)
    assert provider1 is provider2


def test_factory_unknown_stt_provider() -> None:
    """Unknown STT provider name raises ValueError."""
    reset_voice_singletons()
    bad_cfg = VoiceSettings(stt_provider="non_existent_engine")
    with pytest.raises(ValueError, match="Unknown STT provider"):
        get_stt_provider(bad_cfg)


def test_factory_unknown_tts_provider() -> None:
    """Unknown TTS provider name raises ValueError."""
    reset_voice_singletons()
    bad_cfg = VoiceSettings(tts_provider="non_existent_tts")
    with pytest.raises(ValueError, match="Unknown TTS provider"):
        get_tts_provider(bad_cfg)
