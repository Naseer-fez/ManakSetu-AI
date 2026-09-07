"""Unit tests for fast model 64k context window and GPU optimization configuration."""
from __future__ import annotations
from unittest.mock import MagicMock, patch
from backend.config.settings import load_settings, app_settings
from backend.engine.gguf_loader import instantiate_llama
from backend.engine.local_gguf_provider import LocalGgufLlmProvider
from backend.engine.llm_service import get_llm_provider


def test_fast_model_settings_loaded() -> None:
    """Verify fast model and thinking model configuration fields are correctly loaded from config."""
    settings = load_settings()
    assert settings.distributed_reasoning.fast_model_n_ctx == 4096
    assert settings.distributed_reasoning.thinking_model_n_ctx == 32768
    assert settings.distributed_reasoning.fast_model_n_gpu_layers == 36
    assert settings.distributed_reasoning.fast_model_kv_quant == "q8_0"
    assert settings.distributed_reasoning.fast_model_rope_freq_scale == 1.0


def test_local_provider_uses_fast_model_config_in_mac_mode() -> None:
    """Verify LocalGgufLlmProvider defaults to fast model configuration when Mac mode is active."""
    with patch.object(app_settings.distributed_reasoning, "mac_available", True):
        with patch.object(app_settings.distributed_reasoning, "fast_model_n_ctx", 65536):
            with patch.object(app_settings.distributed_reasoning, "fast_model_n_gpu_layers", 36):
                with patch.object(app_settings.distributed_reasoning, "fast_model_rope_freq_scale", 0.5):
                    with patch.object(app_settings.distributed_reasoning, "fast_model_kv_quant", "q4_0"):
                        provider = LocalGgufLlmProvider()
                        assert provider._n_ctx == 65536
                        assert provider._n_gpu_layers == 36
                        assert provider._rope_freq_scale == 0.5
                        assert provider._kv_quant == "q4_0"


@patch("llama_cpp.Llama")
def test_instantiate_llama_applies_rope_and_kv_quant(mock_llama: MagicMock) -> None:
    """Verify instantiate_llama applies rope_freq_scale and 4-bit KV cache."""
    instantiate_llama(
        model_path="dummy.gguf",
        context_size=65536,
        threads=4,
        gpu_layers=36,
        chat_format="chatml",
        rope_freq_scale=0.5,
        kv_quant="q4_0",
    )
    mock_llama.assert_called_once()
    _, kwargs = mock_llama.call_args
    assert kwargs.get("n_ctx") == 65536
    assert kwargs.get("n_gpu_layers") == 36
    assert kwargs.get("rope_freq_scale") == 0.5
    assert "type_k" in kwargs
    assert "type_v" in kwargs


@patch("llama_cpp.Llama")
def test_instantiate_llama_auto_derives_rope_scale(mock_llama: MagicMock) -> None:
    """Verify instantiate_llama auto-derives 0.5 rope scale for 64k when not explicitly passed."""
    instantiate_llama(
        model_path="dummy.gguf",
        context_size=65536,
        threads=4,
        gpu_layers=36,
        chat_format="chatml",
        rope_freq_scale=None,
    )
    mock_llama.assert_called_once()
    _, kwargs = mock_llama.call_args
    assert kwargs.get("rope_freq_scale") == 0.5
