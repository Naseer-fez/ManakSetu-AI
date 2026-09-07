"""MMS-VITS local CPU/GPU Text-to-Speech provider supporting English and Hindi."""
from __future__ import annotations

import asyncio
import threading
import time
from pathlib import Path
from typing import Any
from backend.config.settings import VoiceSettings, app_settings
from backend.engine.voice.audio_utils import pcm_tensor_to_wav
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
        self._lock = threading.Lock()

    def _get_components(self, language: str) -> tuple[Any, Any]:
        lang_key = "hi" if language.lower().startswith("hi") else "en"
        if lang_key in self._models:
            return self._models[lang_key]

        with self._lock:
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
        logger.info("MMS-TTS unavailable or uninitialized; returning empty audio per Rule [R9].")
        return b""

    def _generate_wav(self, text: str, language: str) -> tuple[bytes, int]:
        mod, tok = self._get_components(language)
        if mod is None or tok is None:
            return self._fallback_tone(), 16000
        try:
            import torch
            inputs = tok(text, return_tensors="pt").to(self._device)
            with torch.inference_mode():
                output = mod(**inputs).waveform
            rate = int(getattr(mod.config, "sampling_rate", 16000))
            wav = pcm_tensor_to_wav(output, sample_rate=rate)
            return (wav, rate) if len(wav) > 100 else (self._fallback_tone(), rate)
        except (RuntimeError, OSError, ValueError) as exc:
            logger.warning(f"MMS synthesis error ({type(exc).__name__}): {exc}")
            return self._fallback_tone(), 16000

    def _synthesize_sync(self, text: str, language: str = "en") -> SynthesisResult:
        clean = " ".join(text.split()[:40]) if text else "BIS Indian Standard Recommendation."
        start_t = time.perf_counter()
        wav, rate = self._generate_wav(clean, language)
        elapsed = time.perf_counter() - start_t
        if len(wav) > 100:
            logger.info(f"Synthesized {len(clean)} chars in {elapsed:.2f}s (lang={language})")
        return SynthesisResult(audio_bytes=wav, sample_rate=rate, duration_sec=elapsed, language=language)

    def _synthesize_sentence_sync(self, sentence: str, language: str = "en") -> SynthesisResult:
        clean = sentence.strip() if sentence else ""
        if not clean:
            return SynthesisResult(audio_bytes=b"", sample_rate=16000, language=language)
        start_t = time.perf_counter()
        wav, rate = self._generate_wav(clean, language)
        return SynthesisResult(audio_bytes=wav, sample_rate=rate, duration_sec=time.perf_counter() - start_t, language=language)

    async def synthesize_sentence(self, sentence: str, language: str = "en") -> SynthesisResult:
        return await asyncio.to_thread(self._synthesize_sentence_sync, sentence, language)

    async def synthesize(self, text: str, language: str = "en") -> SynthesisResult:
        return await asyncio.to_thread(self._synthesize_sync, text, language)
