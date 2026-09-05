"""Factory for instantiating Speech-to-Text and Text-to-Speech providers."""
from __future__ import annotations

from typing import Type
from backend.config.settings import VoiceSettings, app_settings
from backend.engine.voice.faster_whisper_stt import FasterWhisperSTT
from backend.engine.voice.mms_vits_tts import MmsVitsTTS
from backend.engine.voice.stt_provider import SpeechToTextProvider
from backend.engine.voice.tts_provider import TextToSpeechProvider

_STT_REGISTRY: dict[str, Type[SpeechToTextProvider]] = {
    "faster_whisper": FasterWhisperSTT,
}

_TTS_REGISTRY: dict[str, Type[TextToSpeechProvider]] = {
    "mms_vits": MmsVitsTTS,
}

_stt_singleton: SpeechToTextProvider | None = None
_tts_singleton: TextToSpeechProvider | None = None


def get_stt_provider(settings: VoiceSettings | None = None) -> SpeechToTextProvider:
    """Get or create singleton STT provider according to configuration."""
    global _stt_singleton
    if _stt_singleton is None:
        cfg = settings or app_settings.voice
        cls = _STT_REGISTRY.get(cfg.stt_provider.lower())
        if cls is None:
            raise ValueError(f"Unknown STT provider '{cfg.stt_provider}'. Available: {list(_STT_REGISTRY.keys())}")
        _stt_singleton = cls(cfg)
    return _stt_singleton


def get_tts_provider(settings: VoiceSettings | None = None) -> TextToSpeechProvider:
    """Get or create singleton TTS provider according to configuration."""
    global _tts_singleton
    if _tts_singleton is None:
        cfg = settings or app_settings.voice
        cls = _TTS_REGISTRY.get(cfg.tts_provider.lower())
        if cls is None:
            raise ValueError(f"Unknown TTS provider '{cfg.tts_provider}'. Available: {list(_TTS_REGISTRY.keys())}")
        _tts_singleton = cls(cfg)
    return _tts_singleton


def reset_voice_singletons() -> None:
    """Reset singletons (useful for test isolations)."""
    global _stt_singleton, _tts_singleton
    _stt_singleton = None
    _tts_singleton = None
