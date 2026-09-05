"""Text-to-Speech abstract provider interface and data models."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class SynthesisResult:
    """Result of text-to-speech audio synthesis."""
    audio_bytes: bytes
    sample_rate: int = 16000
    duration_sec: float = 0.0
    language: str = "en"


class TextToSpeechProvider(ABC):
    """Abstract base class for all Text-to-Speech providers."""

    @abstractmethod
    async def synthesize(self, text: str, language: str = "en") -> SynthesisResult:
        """Synthesize technical response text into spoken WAV audio bytes."""
        raise NotImplementedError

    @abstractmethod
    def preload(self) -> None:
        """Pre-load model weights into memory."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Return True if model and dependencies are available for inference."""
        raise NotImplementedError

    @abstractmethod
    def provider_name(self) -> str:
        """Return descriptive name of the TTS provider."""
        raise NotImplementedError
