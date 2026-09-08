"""Live voice WebSocket session handler coordinating STT, LLM streaming, and TTS."""
from __future__ import annotations

import json, time
from typing import Any
from fastapi import WebSocket
from backend.config.settings import VoiceSettings, app_settings
from backend.engine.llm_service import get_llm_provider
from backend.engine.voice.live_voice_streamer import LiveVoiceStreamer
from backend.engine.voice.provider_factory import get_stt_provider, get_tts_provider
from backend.engine.voice.sentence_buffer import SentenceBuffer
from backend.logger.app_logger import get_logger
from backend.models.voice_live_contracts import (
    ErrorEvent, ResponseCompleteEvent, SessionStatusEvent, SttFinalEvent,
)

logger = get_logger("engine.voice.live_session")


class LiveVoiceSession:
    """Manages a single live voice WebSocket conversation session."""

    def __init__(self, websocket: WebSocket, settings: VoiceSettings | None = None) -> None:
        cfg = settings or app_settings.voice
        self._ws, self._stt, self._tts = websocket, get_stt_provider(), get_tts_provider()
        self._llm = get_llm_provider("fast")
        self._buffer = SentenceBuffer(cfg.live_sentence_delimiters)
        self._streamer = LiveVoiceStreamer(self._llm, self._tts, self._buffer, self._send_event)
        self._history: list[dict[str, str]] = []
        self._max_turns: int = cfg.live_max_turns
        self._turn_index: int = 0
        self._language: str = cfg.default_language

    async def run(self) -> None:
        """Main event loop — receive messages and dispatch handlers."""
        logger.info("Live voice session started")
        await self._send_event(SessionStatusEvent(
            status="ready", stt_available=self._stt.is_available(),
            tts_available=self._tts.is_available(),
            llm_available=self._llm.is_loaded() if hasattr(self._llm, "is_loaded") else True,
        ))
        while True:
            message = await self._ws.receive()
            if message.get("type") == "websocket.disconnect":
                logger.info("Live voice WebSocket disconnected")
                break
            if message.get("bytes"):
                await self._handle_audio(message["bytes"])
            elif message.get("text"):
                await self._handle_control(message["text"])

    async def _handle_audio(self, audio_bytes: bytes) -> None:
        """Process a speech segment: STT -> LLM stream -> TTS stream."""
        t0 = time.perf_counter()
        try:
            stt_result = await self._stt.transcribe(audio_bytes, language=self._language)
        except (RuntimeError, OSError, ValueError) as exc:
            logger.error(f"STT transcription failed: {exc}")
            await self._send_event(ErrorEvent(message=str(exc), component="stt"))
            return

        text = stt_result.text.strip()
        logger.info(f"STT transcribed: '{text}' (lang={stt_result.language})")
        await self._send_event(SttFinalEvent(text=text, language=stt_result.language, confidence=stt_result.confidence, duration_sec=stt_result.duration_sec))

        if not text:
            await self._send_event(ResponseCompleteEvent(full_text="", turn_index=self._turn_index, processing_time_ms=(time.perf_counter() - t0) * 1000.0))
            return

        tts_lang = self._language if self._language != "auto" else (stt_result.language or "en")
        full_text = await self._streamer.stream_llm_tts(text, language=tts_lang)
        self._history.extend([{"role": "user", "content": text}, {"role": "assistant", "content": full_text}])
        self._history = self._history[-self._max_turns * 2:]
        await self._send_event(ResponseCompleteEvent(full_text=full_text, turn_index=self._turn_index, processing_time_ms=(time.perf_counter() - t0) * 1000.0))
        self._turn_index += 1

    async def _send_event(self, event: Any) -> None:
        try:
            await self._ws.send_json(event.model_dump())
        except (RuntimeError, OSError):
            pass

    async def _handle_control(self, raw: str) -> None:
        try:
            data = json.loads(raw)
            act = data.get("action")
            if act == "ping":
                await self._send_event(SessionStatusEvent(status="pong"))
            elif act == "reset":
                self._history.clear(); self._buffer.reset(); self._turn_index = 0
            elif act == "set_language":
                self._language = str(data.get("language", "auto"))
        except (json.JSONDecodeError, TypeError):
            pass
