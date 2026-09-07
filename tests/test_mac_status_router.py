"""Unit tests for /api/v1/mac-status router and Mac configuration."""
from __future__ import annotations
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.config.settings import load_settings


def test_mac_status_endpoint_returns_configured_host_and_port() -> None:
    """Ensure /api/v1/mac-status returns 200 with the configured endpoint, host, and port."""
    client = TestClient(app)
    response = client.get("/api/v1/mac-status")
    assert response.status_code == 200
    data = response.json()
    assert "endpoint" in data
    assert "10.118.237.94" in data["endpoint"]
    assert data["host"] == "10.118.237.94"
    assert data["port"] == 5008
    assert "online" in data
    assert isinstance(data["online"], bool)


def test_load_settings_reads_mac_endpoint_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """Ensure load_settings respects the MAC_ENDPOINT environment variable."""
    test_endpoint = "http://192.168.1.100:9999/reason"
    monkeypatch.setenv("MAC_ENDPOINT", test_endpoint)
    settings = load_settings()
    assert settings.distributed_reasoning.mac_endpoint == test_endpoint
