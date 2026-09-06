"""Low-level GGUF runtime loader with multi-tier CUDA fallback."""
from __future__ import annotations

import gc
from pathlib import Path
from typing import Any
from backend.logger.app_logger import get_logger

logger = get_logger("engine.gguf_loader")


def instantiate_llama(
    model_path: str,
    context_size: int,
    threads: int,
    gpu_layers: int,
    chat_format: str,
    rope_freq_scale: float | None = None,
    kv_quant: str | None = None,
) -> Any:
    """Instantiate Llama runtime with specified context size and GPU offload layers."""
    import llama_cpp
    from llama_cpp import Llama

    gc.collect()
    logger.info(f"Local GGUF: Loading '{model_path}' (ctx={context_size}, gpu={gpu_layers})...")
    
    extra_kwargs: dict[str, Any] = {}
    scale = rope_freq_scale
    if scale is None and context_size > 32768:
        scale = round(32768.0 / context_size, 4)
    if scale is not None and scale > 0.0:
        extra_kwargs["rope_freq_scale"] = scale
        logger.info(f"Local GGUF: Applied RoPE frequency scale {scale} for {context_size} context.")

    q_type = (kv_quant or "").lower().strip()
    if q_type in ("q4_0", "q4", "4bit"):
        q4 = getattr(llama_cpp, "GGML_TYPE_Q4_0", 2)
        extra_kwargs["type_k"] = q4
        extra_kwargs["type_v"] = q4
        logger.info(f"Local GGUF: Configured 4-bit quantized KV cache (Q4_0) for {context_size} context.")
    elif q_type in ("q8_0", "q8", "8bit"):
        q8 = getattr(llama_cpp, "GGML_TYPE_Q8_0", 8)
        extra_kwargs["type_k"] = q8
        extra_kwargs["type_v"] = q8
        logger.info(f"Local GGUF: Configured 8-bit quantized KV cache (Q8_0) for {context_size} context.")
    elif q_type in ("f16", "fp16"):
        logger.info(f"Local GGUF: Configured uncompressed FP16 KV cache for {context_size} context.")
    elif context_size >= 8192:
        q4 = getattr(llama_cpp, "GGML_TYPE_Q4_0", 2)
        extra_kwargs["type_k"] = q4
        extra_kwargs["type_v"] = q4
        logger.info(f"Local GGUF: Enabled 4-bit quantized KV cache (Q4_0) for {context_size} context.")
    elif context_size >= 4096:
        q8 = getattr(llama_cpp, "GGML_TYPE_Q8_0", 8)
        extra_kwargs["type_k"] = q8
        extra_kwargs["type_v"] = q8
        logger.info(f"Local GGUF: Enabled 8-bit quantized KV cache (Q8_0) for {context_size} context.")

    return Llama(
        model_path=model_path,
        n_ctx=context_size,
        n_threads=threads,
        n_gpu_layers=gpu_layers if gpu_layers is not None else 0,
        offload_kqv=(gpu_layers != 0),
        flash_attn=(gpu_layers != 0),  # Maximize performance on Ampere/RTX 3050
        chat_format=chat_format,
        verbose=False,
        **extra_kwargs,
    )


def load_gguf_model(
    model_path: str,
    n_ctx: int,
    n_threads: int,
    n_gpu_layers: int,
    chat_format: str,
    rope_freq_scale: float | None = None,
    kv_quant: str | None = None,
) -> Any:
    """Load local GGUF model with multi-tier fallback (GPU -> reduced layers -> CPU)."""
    if not Path(model_path).exists():
        logger.info(f"Local GGUF: Model binary not found at '{model_path}'")
        return None
    from backend.config.settings import app_settings
    configs = [(n_ctx, n_gpu_layers), (1024, n_gpu_layers), (512, n_gpu_layers)]
    if not app_settings.ai_engine.require_cuda:
        configs.append((512, 0))  # Only allow CPU fallback if CUDA is not strictly required
    for ctx_cand, gpu_cand in configs:
        try:
            return instantiate_llama(
                model_path,
                ctx_cand,
                n_threads,
                gpu_cand,
                chat_format,
                rope_freq_scale=rope_freq_scale,
                kv_quant=kv_quant,
            )
        except (ValueError, RuntimeError, TypeError, OSError, ImportError, ModuleNotFoundError) as exc:
            gc.collect()
            logger.warning(f"Local GGUF: Load failed (ctx={ctx_cand}, gpu={gpu_cand}): {exc}")
    return None

