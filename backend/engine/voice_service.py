"""Local offline Voice I/O service refactored to delegate to abstracted voice providers."""
from __future__ import annotations

import asyncio
from backend.engine.voice.provider_factory import get_stt_provider, get_tts_provider
from backend.logger.app_logger import get_logger

logger = get_logger("engine.voice_service")


class VoiceService:
    """Backward-compatible voice service delegating to abstracted STT and TTS providers."""

    def __init__(self) -> None:
        self._stt = get_stt_provider()
        self._tts = get_tts_provider()

    def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.wav", language: str = "auto") -> str:
        """Transcribe speech audio bytes locally using configured STT provider."""
        if not audio_bytes or len(audio_bytes) < 44:
            return ""
        if hasattr(self._stt, "_transcribe_sync"):
            res = self._stt._transcribe_sync(audio_bytes, language=language)
            return res.text if res.text else ""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    res = pool.submit(asyncio.run, self._stt.transcribe(audio_bytes, language=language)).result()
                    return res.text if res.text else ""
            return asyncio.run(self._stt.transcribe(audio_bytes, language=language)).text
        except (RuntimeError, ValueError, OSError) as exc:
            logger.warning(f"VoiceService fallback on STT ({type(exc).__name__}): {exc}")
            return ""

    def synthesize_speech(self, text: str, language: str = "en") -> bytes:
        """Synthesize technical recommendation text to local spoken WAV audio bytes."""
        if hasattr(self._tts, "_synthesize_sync"):
            return self._tts._synthesize_sync(text, language=language).audio_bytes
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    return pool.submit(asyncio.run, self._tts.synthesize(text, language=language)).result().audio_bytes
            return asyncio.run(self._tts.synthesize(text, language=language)).audio_bytes
        except (RuntimeError, ValueError, OSError) as exc:
            logger.warning(f"VoiceService fallback on TTS ({type(exc).__name__}): {exc}")
            return b""
