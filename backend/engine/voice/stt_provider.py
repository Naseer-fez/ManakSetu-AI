"""Speech-to-Text abstract provider interface and data models."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class TranscriptionResult:
    """Result of speech-to-text transcription."""
    text: str
    language: str
    duration_sec: float = 0.0
    confidence: float | None = None


class SpeechToTextProvider(ABC):
    """Abstract base class for all Speech-to-Text providers."""

    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, language: str | None = None) -> TranscriptionResult:
        """Transcribe audio bytes to text with optional language hint."""
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
        """Return descriptive name of the STT provider."""
        raise NotImplementedError
