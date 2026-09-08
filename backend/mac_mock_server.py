"""Standalone mock Mac reasoning endpoint routing inference to Cloud LLM."""
from __future__ import annotations
import os
from typing import Any, AsyncGenerator
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
from backend.engine.llm_interface import BaseLlmProvider
from backend.engine.llm_providers import GeminiLlmProvider, OpenRouterLlmProvider
from backend.logger.app_logger import get_logger

load_dotenv()

logger = get_logger("backend.mac_mock_server")

app = FastAPI(
    title="BIS-SpecAI Mac Reasoning Server (Cloud-Bridged Mock)",
    description="Emulates remote Mac M-series reasoning node, offloading inference to Cloud LLM.",
    version="1.0.0",
)


def _init_cloud_provider() -> BaseLlmProvider:
    """Initialize cloud LLM provider for the Mac reasoning bridge."""
    cloud_model = os.getenv("MAC_CLOUD_MODEL", "google/gemini-2.0-flash-001")
    if os.getenv("OPENROUTER_API_KEY"):
        return OpenRouterLlmProvider(model=cloud_model)
    if os.getenv("GEMINI_API_KEY"):
        return GeminiLlmProvider(model=cloud_model)
    return OpenRouterLlmProvider(model=cloud_model)


cloud_reasoner: BaseLlmProvider = _init_cloud_provider()


class ReasonRequest(BaseModel):
    prompt: str
    system_prompt: str = ""
    stream: bool = False


class ReasonResponse(BaseModel):
    response: str
    source: str = "mac_m3_cloud_bridge"


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check for remote Mac node."""
    return {"status": "online", "device": "Mac M-Series (Cloud Bridge)", "model": os.getenv("MAC_CLOUD_MODEL", "cloud")}


@app.post("/reason", response_model=None)
async def reason_endpoint(req: ReasonRequest) -> Any:
    """Perform heavy reasoning via Cloud LLM; report offline if unavailable (R9 compliant)."""
    logger.info(f"Mock Mac Server received reasoning request (stream={req.stream})")
    try:
        cloud_res = await cloud_reasoner.generate_text(req.prompt, req.system_prompt)
    except (RuntimeError, OSError, ValueError, ConnectionError, TimeoutError) as exc:
        logger.warning(f"Cloud LLM unreachable: {type(exc).__name__}: {exc}")
        cloud_res = None

    if not cloud_res or "No LLM model is currently available" in cloud_res:
        offline_msg = (
            "Mac reasoning node is currently offline. "
            "No AI model is available to process this request."
        )
        if req.stream:
            async def offline_stream() -> AsyncGenerator[str, None]:
                yield offline_msg + "\n"
            return StreamingResponse(offline_stream(), media_type="text/plain")
        return ReasonResponse(response=offline_msg, source="mac_m3_cloud_bridge_offline")

    if req.stream:
        async def stream_gen() -> AsyncGenerator[str, None]:
            for line in cloud_res.split("\n"):
                yield line + "\n"
        return StreamingResponse(stream_gen(), media_type="text/plain")
    return ReasonResponse(response=cloud_res)


def start() -> None:
    """Launch mock Mac server on configured port."""
    host = os.getenv("MAC_MOCK_HOST", "127.0.0.1")
    port = int(os.getenv("MAC_MOCK_PORT", "5000"))
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    start()
