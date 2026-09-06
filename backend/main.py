"""FastAPI application entry point for Indian Standards AI Recommendation Engine."""
from __future__ import annotations

from contextlib import asynccontextmanager
import asyncio
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
from backend.api.voice_live_router import router as voice_live_router
from backend.api.workspace_router import router as workspace_router
from backend.config.paths import TTS_CACHE_DIR
from backend.config.settings import app_settings
from backend.data.seed_generator import generate_seed_data
from backend.engine.model_warmup import warmup_backend_ai_models
from backend.engine.gpu_diagnostics import get_gpu_memory_info
from backend.logger.app_logger import get_logger, setup_logging
from backend.middleware.telemetry import log_requests_middleware

logger = get_logger("backend.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context ensuring seed data, VRAM caching, and model warmup."""
    setup_logging()
    logger.info("BIS-SpecAI Backend initializing...")
    gpu_diag = get_gpu_memory_info()
    logger.info(
        f"[R10 CUDA Boot Status] Available: {gpu_diag.get('cuda_available')}, "
        f"Device: {gpu_diag.get('device_name')}, Allocated: {gpu_diag.get('allocated_mb')}MB, "
        f"Reserved: {gpu_diag.get('reserved_mb')}MB"
    )
    if app_settings.ai_engine.require_cuda and not gpu_diag.get("cuda_available"):
        logger.error("[R10 Violation] CUDA is required by config but no CUDA-capable device detected at boot!")
    await asyncio.to_thread(generate_seed_data)
    await asyncio.to_thread(warmup_backend_ai_models)
    logger.info("BIS-SpecAI Backend ready to accept requests")
    yield
    logger.info("BIS-SpecAI Backend shutting down...")
    # Flush semantic cache
    try:
        from backend.engine.cache_service import SemanticCacheService
        logger.info("Flushing semantic cache...")
    except (ImportError, RuntimeError) as exc:
        logger.warning(f"Cache flush skipped: {exc}")
    # Log final GPU state
    try:
        gpu_final = get_gpu_memory_info()
        logger.info(
            f"[Shutdown GPU State] Allocated: {gpu_final.get('allocated_mb')}MB, "
            f"Reserved: {gpu_final.get('reserved_mb')}MB"
        )
    except (RuntimeError, OSError) as exc:
        logger.warning(f"GPU diagnostics at shutdown failed: {exc}")
    logger.info("BIS-SpecAI Backend shutdown complete")


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
app.include_router(voice_live_router)
app.include_router(workspace_router)

TTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/api/v1/voice/audio", StaticFiles(directory=str(TTS_CACHE_DIR)), name="voice_audio")


@app.get("/api/v1/health")
async def health_check() -> dict[str, object]:
    """Health check endpoint with dependency status."""
    gpu = get_gpu_memory_info()
    # Check LLM model status
    llm_status = "unknown"
    try:
        from backend.engine.llm_service import get_llm_provider
        provider = get_llm_provider()
        llm_status = "loaded" if getattr(provider, 'is_loaded', lambda: False)() else "offline"
    except (ImportError, RuntimeError, ValueError):
        llm_status = "unavailable"
    # Check embedding model status
    embed_status = "unknown"
    try:
        from backend.engine.embedding_service import get_embedding_service
        embed_svc = get_embedding_service()
        embed_status = "offline" if embed_svc._is_offline else ("loaded" if embed_svc._model is not None else "not_loaded")
    except (ImportError, RuntimeError, ValueError):
        embed_status = "unavailable"
    return {
        "status": "healthy" if gpu["cuda_available"] else "degraded",
        "service": "Indian Standards AI Engine",
        "version": "1.0.0",
        "cuda": str(gpu["cuda_available"]),
        "gpu_device": str(gpu["device_name"]),
        "llm_model": llm_status,
        "embedding_model": embed_status,
    }


@app.get("/metrics")
async def metrics_endpoint() -> Response:
    """Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


def start_server() -> None:
    """Run uvicorn server with configured parameters."""
    uvicorn.run("backend.main:app", host=app_settings.server.host, port=app_settings.server.port, log_level=app_settings.server.log_level.lower(), reload=False)


if __name__ == "__main__":
    start_server()
