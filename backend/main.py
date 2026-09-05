"""FastAPI application entry point for Indian Standards AI Recommendation Engine."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
import uvicorn
from backend.api.distributed_pipeline_router import router as distributed_router
from backend.api.gem_webhook_router import router as gem_router
from backend.api.llm_router import router as llm_router
from backend.api.pipeline_router import router as pipeline_router
from backend.api.recommendation_router import router as rec_router
from backend.api.standards_router import router as std_router
from backend.api.tender_router import router as tender_router
from backend.api.voice_agent_router import router as voice_router
from backend.config.paths import TTS_CACHE_DIR
from backend.config.settings import app_settings
from backend.data.seed_generator import generate_seed_data
from backend.engine.model_warmup import warmup_backend_ai_models
from backend.logger.app_logger import get_logger, setup_logging
from backend.middleware.telemetry import log_requests_middleware

logger = get_logger("backend.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context ensuring seed data, VRAM caching, and model warmup."""
    setup_logging()
    logger.info("BIS-SpecAI Backend initializing...")
    generate_seed_data()
    warmup_backend_ai_models()
    logger.info("BIS-SpecAI Backend ready to accept requests")
    yield
    logger.info("BIS-SpecAI Backend shutting down")


app = FastAPI(
    title="BIS Indian Standards AI Recommendation Engine",
    description="AI-powered recommendation engine for Indian Standards (IS), QCO compliance, and tender auditing.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.server.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(log_requests_middleware)

app.include_router(rec_router)
app.include_router(tender_router)
app.include_router(std_router)
app.include_router(gem_router)
app.include_router(llm_router)
app.include_router(pipeline_router)
app.include_router(distributed_router)
app.include_router(voice_router)

TTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/api/v1/voice/audio", StaticFiles(directory=str(TTS_CACHE_DIR)), name="voice_audio")


@app.get("/api/v1/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "service": "Indian Standards AI Engine", "version": "1.0.0"}


@app.get("/metrics")
async def metrics_endpoint() -> Response:
    """Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


def start_server() -> None:
    """Run uvicorn server with configured parameters."""
    uvicorn.run("backend.main:app", host=app_settings.server.host, port=app_settings.server.port, log_level=app_settings.server.log_level.lower(), reload=False)


if __name__ == "__main__":
    start_server()
