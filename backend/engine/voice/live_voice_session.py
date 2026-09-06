"""Live voice WebSocket session handler coordinating STT, LLM streaming, and TTS."""
from __future__ import annotations

import base64
import json
import time
from typing import Any

from fastapi import WebSocket
from backend.config.settings import VoiceSettings, app_settings
from backend.engine.llm_service import get_llm_provider
from backend.engine.voice.provider_factory import get_stt_provider, get_tts_provider
from backend.engine.voice.sentence_buffer import SentenceBuffer
from backend.logger.app_logger import get_logger
from backend.models.voice_live_contracts import (
    ErrorEvent, LlmChunkEvent, ResponseCompleteEvent,
    SessionStatusEvent, SttFinalEvent, TtsAudioEvent,
)

logger = get_logger("engine.voice.live_session")


class LiveVoiceSession:
    """Manages a single live voice WebSocket conversation session."""

    def __init__(self, websocket: WebSocket, settings: VoiceSettings | None = None) -> None:
        cfg = settings or app_settings.voice
        self._ws = websocket
        self._stt = get_stt_provider()
        self._tts = get_tts_provider()
        self._llm = get_llm_provider("local")
        self._buffer = SentenceBuffer(cfg.live_sentence_delimiters)
        self._history: list[dict[str, str]] = []
        self._max_turns: int = cfg.live_max_turns
        self._turn_index: int = 0

    async def run(self) -> None:
        """Main event loop — receive messages and dispatch handlers."""
        await self._send_event(SessionStatusEvent(
            status="ready",
            stt_available=self._stt.is_available(),
            tts_available=self._tts.is_available(),
            llm_available=self._llm.is_loaded() if hasattr(self._llm, 'is_loaded') else True,
        ))
        while True:
            message = await self._ws.receive()
            msg_type = message.get("type", "")
            if msg_type == "websocket.disconnect":
                break
            if "bytes" in message and message["bytes"]:
                await self._handle_audio(message["bytes"])
            elif "text" in message and message["text"]:
                await self._handle_control(message["text"])

    async def _handle_audio(self, audio_bytes: bytes) -> None:
        """Process a speech segment: STT -> LLM stream -> TTS stream."""
        t0 = time.perf_counter()
        try:
            stt_result = await self._stt.transcribe(audio_bytes)
        except (RuntimeError, OSError, ValueError) as exc:
            await self._send_event(ErrorEvent(message=str(exc), component="stt"))
            return
        await self._send_event(SttFinalEvent(
            text=stt_result.text, language=stt_result.language,
            confidence=stt_result.confidence, duration_sec=stt_result.duration_sec,
        ))
        if not stt_result.text.strip():
            return
        full_text = await self._stream_llm_tts(stt_result.text, language=stt_result.language or "en")
        self._history.append({"role": "user", "content": stt_result.text})
        self._history.append({"role": "assistant", "content": full_text})
        self._trim_history()
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        await self._send_event(ResponseCompleteEvent(
            full_text=full_text, turn_index=self._turn_index, processing_time_ms=elapsed_ms,
        ))
        self._turn_index += 1

    async def _stream_llm_tts(self, query: str, language: str = "en") -> str:
        """Stream LLM tokens -> sentence buffer -> TTS -> WebSocket."""
        prompt = f"User Query: {query}\n\nProvide a rapid, precise answer."
        system_prompt = "You are a fast Indian Standards assistant. Answer concisely."
        full_text = ""
        chunk_idx = 0
        try:
            async for token in self._llm.generate_text_stream(prompt, system_prompt, max_tokens=256, use_grammar=False):
                if token.startswith("{"):
                    continue
                full_text += token
                for sentence in self._buffer.add_token(token):
                    await self._send_event(LlmChunkEvent(text=sentence, chunk_index=chunk_idx))
                    await self._send_tts(sentence, chunk_idx, language=language)
                    chunk_idx += 1
        except (RuntimeError, OSError, ValueError) as exc:
            await self._send_event(ErrorEvent(message=str(exc), component="llm"))
        remaining = self._buffer.flush()
        if remaining:
            await self._send_event(LlmChunkEvent(text=remaining, chunk_index=chunk_idx))
            await self._send_tts(remaining, chunk_idx, language=language)
        return full_text

    async def _send_tts(self, sentence: str, chunk_idx: int, language: str = "en") -> None:
        """Synthesize a sentence and send TTS audio over WebSocket."""
        try:
            tts_result = await self._tts.synthesize_sentence(sentence, language=language)
            audio_b64 = base64.b64encode(tts_result.audio_bytes).decode("ascii")
            await self._send_event(TtsAudioEvent(data=audio_b64, sample_rate=tts_result.sample_rate, chunk_index=chunk_idx))
        except (RuntimeError, OSError, ValueError) as exc:
            await self._send_event(ErrorEvent(message=str(exc), component="tts"))

    async def _send_event(self, event: Any) -> None:
        """Send a Pydantic event model as JSON over the WebSocket."""
        await self._ws.send_json(event.model_dump())

    def _trim_history(self) -> None:
        """Keep only the last N turns in rolling conversation window."""
        max_items = self._max_turns * 2
        if len(self._history) > max_items:
            self._history = self._history[-max_items:]

    async def _handle_control(self, raw: str) -> None:
        """Handle JSON control messages from client."""
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return
        action = data.get("action", "")
        if action == "ping":
            await self._ws.send_json({"event": "pong"})
        elif action == "reset":
            self._history.clear()
            self._buffer.reset()
            self._turn_index = 0
