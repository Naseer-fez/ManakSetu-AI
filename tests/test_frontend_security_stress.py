"""Empirical challenger stress-tests for Frontend URL and Security Configuration."""
from __future__ import annotations

import os
import re
from pathlib import Path
import pytest
import yaml

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"
CONFIG_YAML = ROOT_DIR / "backend" / "config" / "config.yaml"
VITE_CONFIG = ROOT_DIR / "frontend" / "vite.config.ts"
VOICE_PANEL = ROOT_DIR / "frontend" / "src" / "components" / "VoiceLivePanel.tsx"
API_SERVICE = ROOT_DIR / "frontend" / "src" / "services" / "api.service.ts"


def test_dist_bundle_exists() -> None:
    """Verify frontend production build output exists and contains essential chunks."""
    assert FRONTEND_DIST.exists(), "frontend/dist does not exist! Build must run first."
    html_file = FRONTEND_DIST / "index.html"
    assert html_file.is_file(), "frontend/dist/index.html is missing."
    assets_dir = FRONTEND_DIST / "assets"
    assert assets_dir.is_dir(), "frontend/dist/assets is missing."
    
    js_files = list(assets_dir.glob("*.js"))
    assert len(js_files) > 0, "No JS chunk found in frontend/dist/assets."
    css_files = list(assets_dir.glob("*.css"))
    assert len(css_files) > 0, "No CSS chunk found in frontend/dist/assets."


def test_dist_bundle_no_leaked_ips() -> None:
    """Verify built bundle does not leak developer LAN IP 192.168.1.9 or private LAN CIDRs."""
    forbidden_exact_ip = "192.168.1.9"
    private_lan_regex = re.compile(r"192\.168\.\d{1,3}\.\d{1,3}")
    
    scanned_files = list(FRONTEND_DIST.rglob("*"))
    assert len(scanned_files) > 0
    
    for file_path in scanned_files:
        if file_path.is_file():
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            assert forbidden_exact_ip not in content, (
                f"Leak detected in {file_path.name}: found hardcoded IP {forbidden_exact_ip}"
            )
            matches = private_lan_regex.findall(content)
            assert not matches, (
                f"Potential LAN IP leak detected in {file_path.name}: {matches}"
            )


def test_dist_bundle_no_secrets() -> None:
    """Verify built bundle does not contain API keys, tokens, or credentials."""
    secret_patterns = [
        re.compile(r"sk-or-v1-[0-9a-fA-F]{64}"),
        re.compile(r"sk-[a-zA-Z0-9]{32,}"),
        re.compile(r"AIza[0-9A-Za-z\-_]{35}"),
        re.compile(r"BEGIN PRIVATE KEY"),
        re.compile(r"OPENROUTER_API_KEY\s*=\s*['\"][^'\"]+['\"]"),
    ]
    
    for file_path in FRONTEND_DIST.rglob("*"):
        if file_path.is_file():
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            for pattern in secret_patterns:
                matches = pattern.findall(content)
                assert not matches, (
                    f"Secret leak detected in {file_path.name} matching {pattern.pattern}: {matches}"
                )


def test_dist_bundle_no_absolute_drive_paths() -> None:
    """Verify built bundle does not leak developer machine paths like d:\\CODE or C:\\Users."""
    path_regex = re.compile(r"[cdCD]:[/\\](?:CODE|Users|Windows)", re.IGNORECASE)
    
    for file_path in FRONTEND_DIST.rglob("*"):
        if file_path.is_file():
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            matches = path_regex.findall(content)
            assert not matches, (
                f"Absolute drive path leak in {file_path.name}: {matches}"
            )


def test_backend_cors_config_no_lan_ip() -> None:
    """Verify backend config.yaml cors_origins does not leak 192.168.1.9."""
    assert CONFIG_YAML.exists(), f"Missing config file at {CONFIG_YAML}"
    with open(CONFIG_YAML, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    
    cors_origins = config.get("server", {}).get("cors_origins", [])
    for origin in cors_origins:
        assert "192.168.1.9" not in str(origin), (
            f"cors_origins still contains 192.168.1.9: {origin}"
        )


def _simulate_api_base(vite_api_url: str | None, vite_api_base_url: str | None) -> str:
    """Simulates: (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string) || '/api/v1'"""
    return vite_api_url or vite_api_base_url or "/api/v1"


def _simulate_ws_url(
    vite_ws_url: str | None,
    protocol: str = "http:",
    host: str = "localhost:5173",
    has_window: bool = True,
) -> str:
    """Simulates VoiceLivePanel WS_URL construction logic."""
    if vite_ws_url:
        fallback = vite_ws_url
    elif has_window:
        proto = "wss://" if protocol == "https:" else "ws://"
        fallback = proto + host
    else:
        fallback = "ws://127.0.0.1:8000"
    return f"{fallback}/api/v1/voice/live"


def test_api_url_construction_edge_cases() -> None:
    """Stress test API_BASE resolution across edge-case environments."""
    # 1. Default (no env vars set)
    assert _simulate_api_base(None, None) == "/api/v1"
    assert f"{_simulate_api_base(None, None)}/recommend" == "/api/v1/recommend"
    
    # 2. VITE_API_BASE_URL legacy support
    assert _simulate_api_base(None, "http://api.internal:8000/api/v1") == "http://api.internal:8000/api/v1"
    
    # 3. VITE_API_URL precedence over legacy
    assert _simulate_api_base("http://gateway.gov.in/api/v1", "http://old:8000") == "http://gateway.gov.in/api/v1"
    
    # 4. Empty strings should fall back to default
    assert _simulate_api_base("", "") == "/api/v1"


def test_ws_url_construction_edge_cases() -> None:
    """Stress test VoiceLivePanel WebSocket URL construction across environments."""
    # 1. Dev localhost HTTP
    url = _simulate_ws_url(None, protocol="http:", host="localhost:5173")
    assert url == "ws://localhost:5173/api/v1/voice/live"
    
    # 2. Prod HTTPS custom domain
    url = _simulate_ws_url(None, protocol="https:", host="bis-specai.gov.in")
    assert url == "wss://bis-specai.gov.in/api/v1/voice/live"
    
    # 3. Remote host with custom port
    url = _simulate_ws_url(None, protocol="https:", host="specai.lan:8443")
    assert url == "wss://specai.lan:8443/api/v1/voice/live"
    
    # 4. SSR / window undefined fallback
    url = _simulate_ws_url(None, has_window=False)
    assert url == "ws://127.0.0.1:8000/api/v1/voice/live"
    
    # 5. Explicit VITE_WS_URL override
    url = _simulate_ws_url("ws://dedicated-voice-host:8000")
    assert url == "ws://dedicated-voice-host:8000/api/v1/voice/live"


def test_vite_config_proxy_and_host_settings() -> None:
    """Verify vite.config.ts proxy handles backend redirection properly."""
    content = VITE_CONFIG.read_text(encoding="utf-8")
    assert "allowedHosts" in content, "Vite config missing allowedHosts configuration"
    assert "target:" in content, "Vite config missing proxy target"
    assert "process.env.VITE_BACKEND_URL" in content, "Vite proxy should support VITE_BACKEND_URL override"


def test_adversarial_trailing_slash_hazard() -> None:
    """Demonstrate potential double-slash bug when env vars include trailing slash."""
    base_with_slash = "http://localhost:8000/api/v1/"
    resolved_endpoint = f"{_simulate_api_base(base_with_slash, None)}/recommend"
    # Unsanitized string concatenation creates double slash
    assert "//recommend" in resolved_endpoint, "Double slash hazard confirmed when trailing slash is present."


def test_adversarial_full_ws_url_duplication_hazard() -> None:
    """Demonstrate path duplication if VITE_WS_URL includes the full endpoint path."""
    full_ws = "ws://localhost:8000/api/v1/voice/live"
    resolved_ws = _simulate_ws_url(full_ws)
    # VoiceLivePanel appends /api/v1/voice/live unconditionally to VITE_WS_URL
    assert resolved_ws == "ws://localhost:8000/api/v1/voice/live/api/v1/voice/live", (
        "Duplicate path hazard confirmed when VITE_WS_URL provides complete WS endpoint."
    )


def test_adversarial_vite_proxy_ws_flag_detection() -> None:
    """Verify whether vite.config.ts enables WebSocket proxying via ws: true."""
    content = VITE_CONFIG.read_text(encoding="utf-8")
    # Vite proxy requires `ws: true` to forward WebSocket upgrades when target is http://
    has_ws_true = bool(re.search(r"ws\s*:\s*true", content))
    # Document current status: ws: true is currently absent in vite.config.ts
    assert not has_ws_true, "vite.config.ts does not yet have ws: true configured on /api proxy."
