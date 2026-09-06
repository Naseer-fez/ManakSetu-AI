"""CUDA policy enforcement for document and LLM workflows."""
from __future__ import annotations

import asyncio

from backend.config.settings import app_settings

try:
    import torch
    _TORCH_AVAILABLE = True
except ImportError:
    torch = None  # type: ignore[assignment]
    _TORCH_AVAILABLE = False


class CudaUnavailableError(RuntimeError):
    """Raised when a GPU-required operation cannot use the configured device."""


def require_cuda() -> dict[str, object]:
    """Validate CUDA availability and return a small diagnostic payload."""
    if not app_settings.ai_engine.require_cuda:
        return {"required": False, "device": app_settings.ai_engine.gpu_device}
    if not _TORCH_AVAILABLE:
        raise CudaUnavailableError("PyTorch is not installed; CUDA is required")
    if not torch.cuda.is_available():
        raise CudaUnavailableError("CUDA is unavailable; BIS-SpecAI requires cuda:0")
    configured = app_settings.ai_engine.gpu_device
    device = torch.device(configured)
    if device.type != "cuda":
        raise CudaUnavailableError(f"Configured GPU device '{configured}' is not a CUDA device")
    expected_index = device.index if device.index is not None else 0
    if expected_index != 0 and torch.cuda.device_count() <= expected_index:
        raise CudaUnavailableError(f"CUDA device index {expected_index} is not available")
    return {"required": True, "device": str(device), "name": torch.cuda.get_device_name(device)}


async def require_cuda_async() -> dict[str, object]:
    """Async-safe wrapper that avoids blocking the event loop on first torch import."""
    return await asyncio.to_thread(require_cuda)
