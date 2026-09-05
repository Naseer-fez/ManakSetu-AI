"""Voice engine package for Speech-to-Text, Text-to-Speech, and agent orchestration."""
from __future__ import annotations

from backend.engine.voice.faster_whisper_stt import FasterWhisperSTT
from backend.engine.voice.mms_vits_tts import MmsVitsTTS
from backend.engine.voice.provider_factory import (
    get_stt_provider,
    get_tts_provider,
    reset_voice_singletons,
)
from backend.engine.voice.stt_provider import SpeechToTextProvider, TranscriptionResult
from backend.engine.voice.tts_provider import SynthesisResult, TextToSpeechProvider
from backend.engine.voice.voice_agent_orchestrator import VoiceAgentOrchestrator

__all__ = [
    "SpeechToTextProvider",
    "TranscriptionResult",
    "TextToSpeechProvider",
    "SynthesisResult",
    "FasterWhisperSTT",
    "MmsVitsTTS",
    "get_stt_provider",
    "get_tts_provider",
    "reset_voice_singletons",
    "VoiceAgentOrchestrator",
]
