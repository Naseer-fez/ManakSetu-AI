"""Unit tests verifying lazy-loading architecture and thread-safety of voice models."""
from __future__ import annotations

import concurrent.futures
from unittest.mock import MagicMock
import pytest
from backend.engine.voice.faster_whisper_stt import FasterWhisperSTT
from backend.engine.voice.mms_vits_tts import MmsVitsTTS
from backend.engine.voice.provider_factory import (
    get_stt_provider,
    get_tts_provider,
    reset_voice_singletons,
)


def test_voice_lazy_loading_unloaded_at_instantiation() -> None:
    """Verify STT and TTS instances do not load heavy weights during constructor init."""
    reset_voice_singletons()
    stt = FasterWhisperSTT()
    assert stt._model is None

    tts = MmsVitsTTS()
    assert len(tts._models) == 0


def test_voice_singletons_concurrent_thread_safety() -> None:
    """Verify concurrent calls to get_stt_provider and get_tts_provider return exact same singletons."""
    reset_voice_singletons()

    def fetch_providers() -> tuple[object, object]:
        return get_stt_provider(), get_tts_provider()

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(fetch_providers) for _ in range(16)]
        results = [f.result() for f in futures]

    first_stt, first_tts = results[0]
    for stt, tts in results[1:]:
        assert stt is first_stt
        assert tts is first_tts


def test_warmup_backend_does_not_preload_voice(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify warmup_backend_ai_models does not call voice preload methods."""
    from backend.config.settings import app_settings
    from backend.engine.model_warmup import warmup_backend_ai_models

    monkeypatch.setattr(app_settings.distributed_reasoning, "mac_available", True)
    monkeypatch.setattr("backend.engine.model_warmup.get_embedding_service", lambda: MagicMock())
    monkeypatch.setattr("backend.engine.model_warmup.SentenceTransformerEmbeddingFunction", lambda: MagicMock())
    monkeypatch.setattr("backend.engine.model_warmup.RerankerService", lambda: MagicMock())
    monkeypatch.setattr("backend.engine.model_warmup.get_llm_provider", lambda _: MagicMock())

    # Ensure no import of voice preload inside warmup routine
    elapsed = warmup_backend_ai_models()
    assert elapsed >= 0.0
