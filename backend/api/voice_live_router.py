"""FastAPI WebSocket router for Live Voice conversation streaming."""
from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.config.settings import app_settings
from backend.engine.voice.live_voice_session import LiveVoiceSession
from backend.logger.app_logger import get_logger

logger = get_logger("api.voice_live_router")
router = APIRouter(prefix="/api/v1/voice", tags=["voice_live"])


@router.websocket("/live")
async def voice_live_endpoint(websocket: WebSocket) -> None:
    """WebSocket endpoint for real-time voice conversation."""
    if not app_settings.voice.live_enabled:
        await websocket.close(code=1008, reason="Live voice is disabled")
        return
    await websocket.accept()
    session = LiveVoiceSession(websocket, settings=app_settings.voice)
    try:
        await session.run()
    except WebSocketDisconnect:
        logger.info("Client disconnected from live voice session")
    except Exception as exc:
        logger.error(f"Live voice session error ({type(exc).__name__}): {exc}")
        try:
            await websocket.send_json({"event": "error", "message": str(exc), "component": "session", "recoverable": False})
        except (RuntimeError, OSError, WebSocketDisconnect):
            pass
