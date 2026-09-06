"""MMS-VITS local CPU/GPU Text-to-Speech provider supporting English and Hindi."""
from __future__ import annotations

import asyncio
import io
import math
import struct
import time
import wave
from pathlib import Path
from typing import Any
from backend.config.settings import VoiceSettings, app_settings
from backend.engine.voice.tts_provider import SynthesisResult, TextToSpeechProvider
from backend.logger.app_logger import get_logger

logger = get_logger("engine.voice.mms_vits")


class MmsVitsTTS(TextToSpeechProvider):
    """MMS-VITS Text-to-Speech provider with bilingual (en/hi) model dispatch."""

    def __init__(self, settings: VoiceSettings | None = None) -> None:
        cfg = settings or app_settings.voice
        self._eng_path: str = cfg.tts_eng_model_path
        self._hin_path: str = cfg.tts_hin_model_path
        self._device: str = cfg.tts_device
        self._models: dict[str, tuple[Any, Any]] = {}

    def _get_components(self, language: str) -> tuple[Any, Any]:
        lang_key = "hi" if language.lower().startswith("hi") else "en"
        if lang_key in self._models:
            return self._models[lang_key]

        target_path = self._hin_path if (lang_key == "hi" and Path(self._hin_path).exists()) else self._eng_path
        if not Path(target_path).exists():
            return None, None

        try:
            from transformers import AutoTokenizer, VitsModel
            tok = AutoTokenizer.from_pretrained(target_path, local_files_only=True)
            mod = VitsModel.from_pretrained(target_path, local_files_only=True).to(self._device)
            self._models[lang_key] = (mod, tok)
            logger.info(f"Loaded MMS-TTS [{lang_key}] from {target_path} on {self._device}")
            return mod, tok
        except (ImportError, RuntimeError, OSError, ValueError) as exc:
            logger.warning(f"Failed to load MMS-TTS [{lang_key}] ({type(exc).__name__}): {exc}")
            return None, None
    def preload(self) -> None:
        self._get_components("en")
        self._get_components("hi")

    def is_available(self) -> bool:
        return Path(self._eng_path).exists() or Path(self._hin_path).exists()

    def provider_name(self) -> str:
        return f"MmsVitsTTS({self._device})"

    def _fallback_tone(self) -> bytes:
        """Conform to Rule [R9] (Truthfulness): Never synthesize fake/mock domain audio."""
        logger.info("MMS-TTS unavailable or uninitialized; returning empty audio per Rule [R9].")
        return b""

    def _synthesize_sync(self, text: str, language: str = "en") -> SynthesisResult:
        clean = " ".join(text.split()[:40]) if text else "BIS Indian Standard Recommendation."
        mod, tok = self._get_components(language)
        start_t = time.perf_counter()

        if mod is not None and tok is not None:
            try:
                import soundfile as sf
                import torch
                inputs = tok(clean, return_tensors="pt").to(self._device)
                with torch.inference_mode():
                    output = mod(**inputs).waveform
                buf = io.BytesIO()
                rate = int(mod.config.sampling_rate)
                audio_np = output.squeeze().detach().cpu().numpy()
                sf.write(buf, audio_np, samplerate=rate, format="WAV")
                wav = buf.getvalue()
                elapsed = time.perf_counter() - start_t
                if len(wav) > 100:
                    logger.info(f"Synthesized {len(clean)} chars in {elapsed:.2f}s (lang={language})")
                    return SynthesisResult(audio_bytes=wav, sample_rate=rate, duration_sec=elapsed, language=language)
            except (RuntimeError, OSError, ValueError) as exc:
                logger.warning(f"MMS synthesis error ({type(exc).__name__}): {exc}")

        wav = self._fallback_tone()
        return SynthesisResult(audio_bytes=wav, sample_rate=16000, duration_sec=time.perf_counter() - start_t, language="en")

    def _synthesize_sentence_sync(self, sentence: str, language: str = "en") -> SynthesisResult:
        """Synthesize a single sentence without word truncation (for streaming mode)."""
        clean = sentence.strip() if sentence else ""
        if not clean:
            return SynthesisResult(audio_bytes=b"", sample_rate=16000, language=language)
        mod, tok = self._get_components(language)
        start_t = time.perf_counter()
        if mod is not None and tok is not None:
            try:
                import soundfile as sf
                import torch
                inputs = tok(clean, return_tensors="pt").to(self._device)
                with torch.inference_mode():
                    output = mod(**inputs).waveform
                buf = io.BytesIO()
                rate = int(mod.config.sampling_rate)
                audio_np = output.squeeze().detach().cpu().numpy()
                sf.write(buf, audio_np, samplerate=rate, format="WAV")
                wav = buf.getvalue()
                elapsed = time.perf_counter() - start_t
                if len(wav) > 100:
                    return SynthesisResult(audio_bytes=wav, sample_rate=rate, duration_sec=elapsed, language=language)
            except (RuntimeError, OSError, ValueError) as exc:
                logger.warning(f"MMS sentence synthesis error ({type(exc).__name__}): {exc}")
        wav = self._fallback_tone()
        return SynthesisResult(audio_bytes=wav, sample_rate=16000, duration_sec=time.perf_counter() - start_t, language="en")

    async def synthesize_sentence(self, sentence: str, language: str = "en") -> SynthesisResult:
        """Async wrapper for single-sentence synthesis (streaming mode)."""
        return await asyncio.to_thread(self._synthesize_sentence_sync, sentence, language)

    async def synthesize(self, text: str, language: str = "en") -> SynthesisResult:
        return await asyncio.to_thread(self._synthesize_sync, text, language)
