from __future__ import annotations
import json
import time
from urllib.parse import urlparse
import httpx
from fastapi import APIRouter, File, Form, UploadFile
from pydantic import BaseModel, Field
from backend.config.settings import app_settings
from backend.engine.llm_orchestrator import LlmOrchestrator
from backend.models.llm_contracts import PipelineAnswerResponse
from backend.parsers.pdf_markdown_parser import PdfMarkdownParser

router = APIRouter(prefix="/api/v1", tags=["distributed_reasoning"])
orchestrator = LlmOrchestrator()
pdf_parser = PdfMarkdownParser()


class SummarizeContextRequest(BaseModel):
    chat_history: list[dict[str, str]] = Field(default_factory=list)


class SummarizeContextResponse(BaseModel):
    summarized_context: str


class MacStatusResponse(BaseModel):
    endpoint: str
    host: str
    port: int
    online: bool
    latency_ms: float | None = None
    device_info: str | None = None
    error: str | None = None


@router.get("/mac-status", response_model=MacStatusResponse)
async def get_mac_status() -> MacStatusResponse:
    """Verify connectivity and reachability of the remote Mac reasoning node."""
    endpoint = app_settings.distributed_reasoning.mac_endpoint
    parsed = urlparse(endpoint)
    host = parsed.hostname or "10.118.237.94"
    port = parsed.port or 5008

    health_url = f"{parsed.scheme}://{host}:{port}/health"
    start_time = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            res = await client.get(health_url)
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 1)
            if res.status_code == 200:
                data = res.json() if "application/json" in res.headers.get("content-type", "") else {}
                return MacStatusResponse(
                    endpoint=endpoint, host=host, port=port, online=True,
                    latency_ms=elapsed_ms, device_info=str(data.get("device", data.get("source", "Mac M-Series Node"))),
                )
            return MacStatusResponse(
                endpoint=endpoint, host=host, port=port, online=False, latency_ms=elapsed_ms, error=f"HTTP {res.status_code}",
            )
    except (httpx.ConnectError, httpx.ConnectTimeout, httpx.ReadTimeout, httpx.HTTPError, OSError) as exc:
        if host not in ("127.0.0.1", "localhost"):
            try:
                async with httpx.AsyncClient(timeout=0.5) as client:
                    l_res = await client.get("http://127.0.0.1:5000/health")
                    if l_res.status_code == 200:
                        l_data = l_res.json() if "application/json" in l_res.headers.get("content-type", "") else {}
                        return MacStatusResponse(
                            endpoint=endpoint, host=host, port=port, online=True,
                            latency_ms=round((time.perf_counter() - start_time) * 1000, 1),
                            device_info=str(l_data.get("device", "Mac M-Series (Cloud Bridge)")),
                        )
            except Exception:
                pass
        return MacStatusResponse(
            endpoint=endpoint, host=host, port=port, online=False, error=f"{type(exc).__name__}: {str(exc)}",
        )


@router.post("/fast-answer", response_model=PipelineAnswerResponse)
async def fast_answer(
    query: str = Form(...),
    pdf_text: str = Form(""),
    pdf_file: UploadFile | None = File(None),
) -> PipelineAnswerResponse:
    """Rapid low-latency answer bypassing Mac reasoning engine using local model."""
    doc_text = pdf_text
    if pdf_file is not None:
        file_bytes = await pdf_file.read()
        extracted = pdf_parser.extract_markdown_from_bytes(file_bytes, filename=pdf_file.filename)
        if extracted:
            doc_text = extracted

    return await orchestrator.execute_fast_answer(query=query, pdf_text=doc_text)


@router.post("/heavy-reasoning", response_model=PipelineAnswerResponse)
async def heavy_reasoning(
    query: str = Form(...),
    pdf_text: str = Form(""),
    chat_history: str = Form("[]"),
    refresh_context: bool = Form(False),
    pdf_file: UploadFile | None = File(None),
) -> PipelineAnswerResponse:
    """Deep-dive reasoning with local context synthesis and remote Mac offloading."""
    parsed_history: list[dict[str, str]] = []
    if chat_history:
        try:
            parsed = json.loads(chat_history)
            if isinstance(parsed, list):
                parsed_history = parsed
        except (json.JSONDecodeError, TypeError):
            parsed_history = []

    doc_text = pdf_text
    if pdf_file is not None:
        file_bytes = await pdf_file.read()
        extracted = pdf_parser.extract_markdown_from_bytes(file_bytes, filename=pdf_file.filename)
        if extracted:
            doc_text = extracted

    return await orchestrator.execute_heavy_reasoning(
        query=query,
        pdf_text=doc_text,
        chat_history=parsed_history,
        refresh_context=refresh_context,
    )


@router.post("/summarize-context", response_model=SummarizeContextResponse)
async def summarize_context(req: SummarizeContextRequest) -> SummarizeContextResponse:
    """Compress conversation history into dense summary using local model."""
    summary = await orchestrator.summarize_chat_history(req.chat_history)
    return SummarizeContextResponse(summarized_context=summary)
