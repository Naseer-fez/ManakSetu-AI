"""Unit tests for Voice Agent API endpoints (/api/v1/voice/*)."""
from __future__ import annotations

import io
from fastapi.testclient import TestClient
import pytest
from backend.main import app


@pytest.fixture
def client() -> TestClient:
    """Fixture providing FastAPI test client."""
    return TestClient(app)


def test_voice_status_endpoint(client: TestClient) -> None:
    """Test /api/v1/voice/status returns active providers and configuration."""
    res = client.get("/api/v1/voice/status")
    assert res.status_code == 200
    data = res.json()
    assert "stt_available" in data
    assert "tts_available" in data
    assert "stt_provider" in data
    assert "tts_provider" in data
    assert data["default_language"] in ("auto", "en", "hi")


def test_voice_chat_endpoint_empty_audio(client: TestClient) -> None:
    """Test /api/v1/voice/chat handles empty audio with fallback response."""
    files = {"audio_file": ("test.wav", io.BytesIO(b""), "audio/wav")}
    data = {"mode": "fast", "language": "auto"}
    res = client.post("/api/v1/voice/chat", files=files, data=data)
    assert res.status_code == 200
    res_data = res.json()
    assert "transcribed_text" in res_data
    assert "llm_response" in res_data
    assert "audio_url" in res_data
    assert res_data["audio_url"].startswith("/api/v1/voice/audio/")


def test_voice_audio_static_serving(client: TestClient) -> None:
    """Test static serving of cached TTS audio file."""
    # Post empty audio to generate a cached file
    files = {"audio_file": ("test.wav", io.BytesIO(b""), "audio/wav")}
    res = client.post("/api/v1/voice/chat", files=files, data={"mode": "fast"})
    assert res.status_code == 200
    audio_url = res.json()["audio_url"]

    # Fetch generated audio
    audio_res = client.get(audio_url)
    assert audio_res.status_code == 200
    assert len(audio_res.content) > 100
