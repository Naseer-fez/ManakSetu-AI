"""Unit tests for audio utility functions and 16-bit PCM WAV normalization."""
from __future__ import annotations

import io
import wave
import numpy as np
import scipy.io.wavfile as wavfile
import torch
from backend.engine.voice.audio_utils import clean_voice_text, pcm_tensor_to_wav


def test_pcm_tensor_to_wav_empty_and_none() -> None:
    """Ensure empty or none tensors return empty bytes without crashing."""
    assert pcm_tensor_to_wav(torch.tensor([])) == b""
    assert pcm_tensor_to_wav(None) == b""  # type: ignore[arg-type]


def test_pcm_tensor_to_wav_valid_and_clamped() -> None:
    """Verify raw float waveform is clamped, scaled to int16 PCM, and encoded to 16kHz WAV."""
    raw_tensor = torch.tensor([[-2.5, -1.0, 0.0, 0.5, 1.0, 3.2]], dtype=torch.float32)
    sample_rate = 16000

    wav_bytes = pcm_tensor_to_wav(raw_tensor, sample_rate=sample_rate)

    assert isinstance(wav_bytes, bytes)
    assert len(wav_bytes) > 44
    assert wav_bytes[:4] == b"RIFF"
    assert wav_bytes[8:12] == b"WAVE"

    with io.BytesIO(wav_bytes) as bio:
        with wave.open(bio, "rb") as wf:
            assert wf.getnchannels() == 1
            assert wf.getsampwidth() == 2
            assert wf.getframerate() == 16000
            assert wf.getnframes() == 6

    sr, data = wavfile.read(io.BytesIO(wav_bytes))
    assert sr == 16000
    assert data.dtype == np.int16
    assert data[0] == -32767
    assert data[1] == -32767
    assert data[2] == 0
    assert abs(data[3] - 16383) <= 1
    assert data[4] == 32767
    assert data[5] == 32767


def test_clean_voice_text_strips_prompt_and_labels() -> None:
    """Verify clean_voice_text removes role labels, prompt echo, and markdown formatting."""
    assert clean_voice_text("Assistant\nIS 456 is for concrete.") == "IS 456 is for concrete."
    assert clean_voice_text("User Query: What is IS 456?\nProvide a rapid, precise answer.\nIS 456 is concrete.") == "IS 456 is concrete."
    assert clean_voice_text("<think>internal thought</think>Direct answer.") == "Direct answer."
    assert clean_voice_text("### Header\n**IS 14286** - Solar PV [link](http://test).") == "Header IS 14286 - Solar PV link."
    assert clean_voice_text("   ...   ") == ""
    assert clean_voice_text("Assistant:") == ""
    assert clean_voice_text("") == ""
