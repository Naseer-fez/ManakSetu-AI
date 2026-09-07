"""Audio processing utilities for waveform normalization, 16-bit PCM WAV encoding, and speech text sanitization."""
from __future__ import annotations

import io
import re
import scipy.io.wavfile as wavfile
import torch


def clean_voice_text(text: str) -> str:
    """Sanitize and clean text for natural text-to-speech voice synthesis.

    Strips reasoning blocks, prompt echos, role labels, markdown formatting,
    citations, and special characters so only essential spoken content remains.
    """
    if not text or not text.strip():
        return ""

    # 1. Remove reasoning / thought blocks (<think>...</think>)
    cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    cleaned = re.sub(r"<think>.*", "", cleaned, flags=re.DOTALL)

    # 2. Remove role labels and prompt echoing prefixes
    cleaned = re.sub(r"^User\s+Query\s*:.*?(?:\n+|$)", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(
        r"^(?:User\s+Query|Query|Prompt|User|Assistant|AI|Bot|Answer)[:\s]+",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(
        r"^(?:Provide a rapid, precise answer\.|Answer concisely\.)\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    # 3. Strip Markdown headers and bold/italic markers
    cleaned = re.sub(r"^\s*#+\s*", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"\*\*([^*]+)\*\*", r"\1", cleaned)
    cleaned = re.sub(r"\*([^*]+)\*", r"\1", cleaned)
    cleaned = re.sub(r"__([^_]+)__", r"\1", cleaned)
    cleaned = re.sub(r"_([^_]+)_", r"\1", cleaned)
    cleaned = re.sub(r"`([^`]+)`", r"\1", cleaned)

    # 4. Strip links and bullet points
    cleaned = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", cleaned)
    cleaned = re.sub(r"https?://\S+", "", cleaned)
    cleaned = re.sub(r"^\s*[\*\-\+]\s+", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"^\s*\d+\.\s+", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"[#\*`_~>\[\]|{}]", "", cleaned)

    # 5. Collapse multiple whitespace and reject non-alphanumeric noise
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned if any(c.isalnum() for c in cleaned) else ""


def pcm_tensor_to_wav(audio_tensor: torch.Tensor, sample_rate: int = 16000) -> bytes:
    """Normalize raw model waveform tensor and encode to 16-bit PCM RIFF WAV bytes."""
    if audio_tensor is None or audio_tensor.numel() == 0:
        return b""

    squeezed = audio_tensor.squeeze()
    if squeezed.ndim == 0 or squeezed.numel() == 0:
        return b""

    # 1. Clip raw float waveform to [-1.0, 1.0] to prevent digital clipping and static buzzing
    clamped = torch.clamp(squeezed, -1.0, 1.0)

    # 2. Scale floating-point amplitudes to signed 16-bit PCM integer range [-32767, 32767]
    pcm_int16 = (clamped * 32767.0).to(torch.int16).cpu().numpy()

    # 3. Write RIFF WAV with exact model native sampling rate
    buf = io.BytesIO()
    wavfile.write(buf, sample_rate, pcm_int16)
    return buf.getvalue()
