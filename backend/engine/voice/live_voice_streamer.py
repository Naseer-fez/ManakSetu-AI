"""Coordinates LLM token streaming, sentence buffering, and TTS synthesis."""
from __future__ import annotations

import base64
from typing import Any, Callable, Coroutine
from backend.engine.voice.audio_utils import clean_voice_text
from backend.engine.voice.sentence_buffer import SentenceBuffer
from backend.engine.voice.tts_provider import TextToSpeechProvider
from backend.logger.app_logger import get_logger
from backend.models.voice_live_contracts import ErrorEvent, LlmChunkEvent, TtsAudioEvent

logger = get_logger("engine.voice.live_streamer")


class LiveVoiceStreamer:
    """Streams LLM tokens into sentence-level TTS synthesis for real-time voice."""

    def __init__(
        self,
        llm: Any,
        tts: TextToSpeechProvider,
        buffer: SentenceBuffer,
        send_fn: Callable[[Any], Coroutine[Any, Any, None]],
    ) -> None:
        self._llm = llm
        self._tts = tts
        self._buffer = buffer
        self._send = send_fn

    async def stream_llm_tts(self, query: str, language: str = "en") -> str:
        """Stream LLM tokens -> clean sentence buffer -> synthesize TTS."""
        sys_prompt = "You are BIS voice assistant. Provide 1-2 clear spoken sentences. No markdown, labels, or greetings."
        full_text, chunk_idx, in_think = "", 0, False
        try:
            async for token in self._llm.generate_text_stream(query.strip(), sys_prompt, max_tokens=256, use_grammar=False):
                if token.startswith("{") and "}" in token:
                    continue
                if "<think>" in token:
                    in_think = True
                if in_think:
                    if "</think>" in token:
                        in_think = False
                    continue
                for raw_sentence in self._buffer.add_token(token):
                    chunk_idx, full_text = await self._process_sentence(raw_sentence, chunk_idx, full_text, language)
        except (RuntimeError, OSError, ValueError) as exc:
            logger.error(f"LLM stream error ({type(exc).__name__}): {exc}")
            await self._send(ErrorEvent(message=str(exc), component="llm"))

        remaining = self._buffer.flush()
        if remaining:
            chunk_idx, full_text = await self._process_sentence(remaining, chunk_idx, full_text, language)
        return full_text

    async def _process_sentence(self, raw: str, idx: int, accumulated: str, lang: str) -> tuple[int, str]:
        clean = clean_voice_text(raw)
        if not clean or not any(c.isalnum() for c in clean):
            return idx, accumulated
        text = (accumulated + " " + clean if accumulated else clean)
        await self._send(LlmChunkEvent(text=clean, chunk_index=idx))
        await self.send_tts(clean, idx, language=lang)
        return idx + 1, text

    async def send_tts(self, sentence: str, chunk_idx: int, language: str = "en") -> None:
        """Synthesize clean speech sentence and emit TTS audio event."""
        clean = clean_voice_text(sentence)
        if not clean or not any(c.isalnum() for c in clean):
            return
        try:
            tts_res = await self._tts.synthesize_sentence(clean, language=language)
            if not tts_res.audio_bytes:
                return
            b64 = base64.b64encode(tts_res.audio_bytes).decode("ascii")
            await self._send(TtsAudioEvent(data=b64, sample_rate=tts_res.sample_rate, chunk_index=chunk_idx))
        except (RuntimeError, OSError, ValueError) as exc:
            logger.error(f"TTS synthesis error ({type(exc).__name__}): {exc}")
            await self._send(ErrorEvent(message=str(exc), component="tts"))
