"""Faster-Whisper local CPU/GPU Speech-to-Text provider implementation."""
from __future__ import annotations

import asyncio
from pathlib import Path
import threading
import time
from typing import Any
from backend.config.settings import VoiceSettings, app_settings
from backend.engine.voice.stt_provider import SpeechToTextProvider, TranscriptionResult
from backend.logger.app_logger import get_logger

logger = get_logger("engine.voice.faster_whisper")


class FasterWhisperSTT(SpeechToTextProvider):
    """Faster-Whisper STT provider with configurable device and compute precision."""

    def __init__(self, settings: VoiceSettings | None = None) -> None:
        cfg = settings or app_settings.voice
        self._model_path: str = cfg.stt_model_path
        self._device: str = cfg.stt_device
        self._compute_type: str = cfg.stt_compute_type
        self._beam_size: int = cfg.stt_beam_size
        self._default_lang: str = cfg.default_language
        self._task: str = cfg.stt_task
        self._initial_prompt: str = getattr(cfg, "stt_initial_prompt", "BIS Bureau of Indian Standards voice conversation. Hello, Hi.")
        self._model: Any = None
        self._lock = threading.Lock()

    def _get_model(self) -> Any:
        if self._model is None:
            with self._lock:
                if self._model is None and Path(self._model_path).exists():
                    try:
                        from faster_whisper import WhisperModel
                        self._model = WhisperModel(self._model_path, device=self._device, compute_type=self._compute_type)
                        logger.info(f"FasterWhisperSTT loaded: {self._model_path} [{self._device}:{self._compute_type}]")
                    except (ImportError, RuntimeError, OSError, ValueError) as exc:
                        logger.warning(f"Failed to load FasterWhisperSTT ({type(exc).__name__}): {exc}")
                        self._model = None
        return self._model
    def preload(self) -> None:
        self._get_model()

    def is_available(self) -> bool:
        return Path(self._model_path).exists()

    def provider_name(self) -> str:
        return f"FasterWhisperSTT({self._device}:{self._compute_type})"

    def _transcribe_sync(self, audio_bytes: bytes, language: str | None = None) -> TranscriptionResult:
        if not audio_bytes or len(audio_bytes) < 44:
            return TranscriptionResult(text="", language=language or self._default_lang)

        model = self._get_model()
        if model is None:
            return TranscriptionResult(text="Speech recognition unavailable", language=language or "en")

        import io
        audio_stream = io.BytesIO(audio_bytes)
        
        start_t = time.perf_counter()
        try:
            target_lang = None if (language in (None, "", "auto") and self._default_lang == "auto") else (language or self._default_lang)
            kwargs: dict[str, Any] = {
                "beam_size": self._beam_size,
                "task": self._task,
                "initial_prompt": self._initial_prompt,
            }
            if target_lang and target_lang != "auto":
                kwargs["language"] = target_lang

            segments, info = model.transcribe(audio_stream, **kwargs)
            text = " ".join(seg.text for seg in segments).strip()
            elapsed = time.perf_counter() - start_t
            det_lang = getattr(info, "language", target_lang or "en")
            prob = float(getattr(info, "language_probability", 1.0))
            logger.info(f"Transcribed ({elapsed:.2f}s, lang={det_lang}, prob={prob:.2f}): '{text[:60]}'")
            return TranscriptionResult(text=text, language=det_lang, duration_sec=elapsed, confidence=prob)
        except (RuntimeError, OSError, ValueError) as exc:
            logger.error(f"Whisper transcription error ({type(exc).__name__}): {exc}")
            return TranscriptionResult(text="", language=language or "en")

    async def transcribe(self, audio_bytes: bytes, language: str | None = None) -> TranscriptionResult:
        return await asyncio.to_thread(self._transcribe_sync, audio_bytes, language)
