"""Workspace API for interactive tender auditing, correction, and export."""
from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import AsyncGenerator
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel
from backend.config.settings import app_settings
from backend.engine.artifact_store import ArtifactStore
from backend.engine.compliance_engine import ComplianceEngine
from backend.engine.revision_engine import RevisionEngine
from backend.engine.template_engine import TemplateEngine, TemplateError
from backend.engine.workspace_store import WorkspaceStore
from backend.engine.llm_service import get_llm_service
from backend.engine.gpu_policy import CudaUnavailableError, require_cuda_async
from backend.engine.hybrid_retriever import HybridRetriever
from backend.engine.singleton_registry import get_singleton
from backend.ingestion.standards_loader import StandardsLoader
from backend.models.document_contracts import ExportPdfRequest, ExportRequest, Revision, TemplateProfile
from backend.parsers.document_parser import DocumentParser
from backend.parsers.pdf_markdown_parser import PdfMarkdownParser
from backend.services.workspace_document_service import (
    count_words,
    markdown_to_editor_html,
    page_count,
    render_pdf,
    safe_pdf_filename,
)

router = APIRouter(prefix="/api/v1/workspaces", tags=["workspaces"])
store = WorkspaceStore(app_settings.storage.workspace_dir)
artifacts = ArtifactStore(app_settings.storage.workspace_dir)
parser = DocumentParser()
pdf_markdown_parser = PdfMarkdownParser()
auditor = ComplianceEngine()
revisions = RevisionEngine()
templates = TemplateEngine()
_standards_loader = StandardsLoader()
retriever = get_singleton("hybrid_retriever", HybridRetriever)


class WorkspaceCreate(BaseModel):
    name: str = "Untitled tender"


class ChatRequest(BaseModel):
    question: str
    document_text: str = ""


class ChatResponse(BaseModel):
    question: str
    answer: str
    grounded: bool = True


MAX_UPLOAD_BYTES = 200 * 1024 * 1024


async def _read_upload(file: UploadFile) -> bytes:
    """Read one upload with the same bounded streaming policy as analysis."""
    chunks: list[bytes] = []
    total_read = 0
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        total_read += len(chunk)
        if total_read > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds 200MB limit")
        chunks.append(chunk)
    return b"".join(chunks)


def _require_workspace(workspace_id: str) -> None:
    if not workspace_id or len(workspace_id) > 80:
        raise HTTPException(status_code=400, detail="Invalid workspace id")


@router.post("", status_code=201)
async def create_workspace(req: WorkspaceCreate) -> dict[str, str]:
    """Create a local workspace without external account state."""
    workspace_id = await store.create(req.name.strip()[:120] or "Untitled tender")
    return {"workspace_id": workspace_id, "name": req.name}


@router.get("/{workspace_id}")
async def get_workspace(workspace_id: str) -> dict[str, object]:
    """Return workspace metadata and uploaded document summaries."""
    _require_workspace(workspace_id)
    workspace = await store.get_workspace(workspace_id)
    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.post("/{workspace_id}/templates", response_model=TemplateProfile)
async def register_template(workspace_id: str, template: TemplateProfile) -> TemplateProfile:
    """Register a built-in or officer-uploaded template profile for later reuse."""
    _require_workspace(workspace_id)
    if await store.get_workspace(workspace_id) is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    await store.save_template(workspace_id, template)
    return template


@router.post("/{workspace_id}/analyze", response_model=dict[str, object])
async def analyze_workspace(workspace_id: str, file: UploadFile | None = File(None), raw_text: str | None = Form(None)) -> dict[str, object]:
    """Ingest one document, audit it, and persist an automatic review revision."""
    _require_workspace(workspace_id)
    try:
        await require_cuda_async()
    except CudaUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if await store.get_workspace(workspace_id) is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    document_name = file.filename if file and file.filename else "tender.txt"
    text = raw_text or ""
    if file:
        content = await _read_upload(file)
        path, digest = await artifacts.save(workspace_id, document_name, content)
        text = await asyncio.to_thread(parser.extract_text_from_file, path)
        await store.add_document(workspace_id, document_name, path, digest, text)
    if not text.strip():
        raise HTTPException(status_code=422, detail="No readable tender text found")
    report, run = await asyncio.to_thread(auditor.analyze, text, document_name)
    await store.save_run(workspace_id, run)
    revision = await asyncio.to_thread(revisions.propose, text, report, run)
    await store.save_revision(workspace_id, revision)
    return {"report": report.model_dump(), "compliance_run": run.model_dump(), "revision": revision.model_dump()}


@router.post("/{workspace_id}/extract")
async def extract_workspace_document(workspace_id: str, file: UploadFile = File(...)) -> dict[str, object]:
    """Persist a PDF and return semantic HTML for the TipTap editor."""
    _require_workspace(workspace_id)
    if await store.get_workspace(workspace_id) is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    document_name = Path(file.filename or "tender.pdf").name
    if not document_name.lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Only PDF uploads are supported")
    content = await _read_upload(file)
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="Uploaded file is not a valid PDF")
    try:
        pages = await asyncio.to_thread(page_count, content)
        markdown_text = await asyncio.to_thread(
            pdf_markdown_parser.extract_markdown_from_bytes, content, document_name
        )
        document_html = await asyncio.to_thread(markdown_to_editor_html, markdown_text)
    except (OSError, RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail="PDF could not be read") from exc
    if not markdown_text.strip() or not document_html.strip():
        raise HTTPException(status_code=422, detail="PDF contains no readable text")
    path, digest = await artifacts.save(workspace_id, document_name, content)
    await store.add_document(workspace_id, document_name, path, digest, markdown_text)
    return {
        "document_html": document_html,
        "markdown": markdown_text,
        "page_count": pages,
        "word_count": count_words(markdown_text),
        "document_name": document_name,
    }


@router.post("/{workspace_id}/revisions/{revision_id}/approve", response_model=Revision)
async def approve_revision(workspace_id: str, revision_id: str) -> Revision:
    """Mark one generated revision as officer-approved without changing its content."""
    _require_workspace(workspace_id)
    revision = await store.get_revision(revision_id)
    if revision is None:
        raise HTTPException(status_code=404, detail="Revision not found")
    revision.status = "APPROVED"
    await store.save_revision(workspace_id, revision)
    return revision


@router.post("/{workspace_id}/chat", response_model=ChatResponse)
async def chat_workspace(workspace_id: str, req: ChatRequest) -> ChatResponse:
    """Answer a grounded procurement question and persist both turns."""
    _require_workspace(workspace_id)
    try:
        await require_cuda_async()
    except CudaUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if await store.get_workspace(workspace_id) is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    service = get_llm_service()
    try:
        matches, evidences = await asyncio.to_thread(
            retriever.search_with_evidence, query=req.question, top_k=5, top_k_chunks=3
        )
        standards = [m[0] for m in matches] if matches else _standards_loader.get_all_standards()[:5]
        history = await store.get_messages(workspace_id)
        answer = await service.answer_procurement_query(
            question=req.question,
            context_standards=standards,
            document_chunks=evidences,
            pdf_text=req.document_text,
            chat_history=history,
        )
    except (RuntimeError, OSError, ValueError) as exc:
        raise HTTPException(status_code=503, detail=f"Assistant unavailable: {type(exc).__name__}") from exc
    await store.add_message(workspace_id, "user", req.question)
    await store.add_message(workspace_id, "assistant", answer)
    return ChatResponse(question=req.question, answer=answer)


@router.post("/{workspace_id}/chat-stream")
async def chat_workspace_stream(workspace_id: str, req: ChatRequest) -> StreamingResponse:
    """Stream a grounded answer over SSE and persist the completed assistant turn."""
    _require_workspace(workspace_id)
    if await store.get_workspace(workspace_id) is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    try:
        await require_cuda_async()
    except CudaUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    service = get_llm_service()
    matches, evidences = await asyncio.to_thread(
        retriever.search_with_evidence, query=req.question, top_k=5, top_k_chunks=3
    )
    standards = [m[0] for m in matches] if matches else _standards_loader.get_all_standards()[:5]
    history = await store.get_messages(workspace_id)

    async def stream() -> AsyncGenerator[str, None]:
        chunks: list[str] = []
        try:
            async for chunk in service.answer_procurement_query_stream(
                question=req.question,
                context_standards=standards,
                document_chunks=evidences,
                pdf_text=req.document_text,
                chat_history=history,
            ):
                chunks.append(chunk)
                yield f"data: {json.dumps({'text': chunk})}\n\n"
            await store.add_message(workspace_id, "user", req.question)
            await store.add_message(workspace_id, "assistant", "".join(chunks))
            yield f"data: {json.dumps({'done': True})}\n\n"
        except (RuntimeError, OSError, ValueError) as exc:
            yield f"data: {json.dumps({'error': type(exc).__name__})}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.delete("/{workspace_id}/chat")
async def clear_workspace_chat(workspace_id: str) -> dict[str, str]:
    """Clear conversation history for a workspace."""
    _require_workspace(workspace_id)
    if await store.get_workspace(workspace_id) is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    await store.clear_messages(workspace_id)
    return {"status": "cleared", "workspace_id": workspace_id}



@router.post("/{workspace_id}/export")
async def export_workspace(workspace_id: str, req: ExportRequest) -> Response:
    """Export a reviewed template; draft exports require an explicit flag."""
    _require_workspace(workspace_id)
    if await store.get_workspace(workspace_id) is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if not req.template.approved and not req.allow_draft:
        raise HTTPException(status_code=409, detail="Template approval is required")
    run = await store.get_latest_run(workspace_id)
    if run and run.export_blocked and not req.allow_draft:
        raise HTTPException(status_code=409, detail="Resolve blocking compliance findings before export")
    document = await store.get_document(workspace_id)
    if not document:
        raise HTTPException(status_code=409, detail="Upload a tender document first")
    source_path = req.template.asset_path or document["path"]
    if not Path(source_path).exists():
        raise HTTPException(status_code=409, detail="Template asset is not available")
    revision = await store.get_revision(req.revision_id) if req.revision_id else None
    if req.revision_id and (revision is None or revision.status != "APPROVED") and not req.allow_draft:
        raise HTTPException(status_code=409, detail="Approve the revision before compliance-checked export")
    try:
        if req.format.lower() == "docx":
            payload = await asyncio.to_thread(templates.render_docx, source_path, req.template, req.values)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = "tender.docx"
        elif req.format.lower() == "pdf":
            payload = await asyncio.to_thread(templates.render_pdf, source_path, req.template, req.values)
            media_type = "application/pdf"
            filename = "tender.pdf"
        else:
            raise HTTPException(status_code=422, detail="format must be docx or pdf")
    except TemplateError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return Response(content=payload, media_type=media_type, headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.post("/{workspace_id}/export-pdf")
async def export_workspace_pdf(workspace_id: str, req: ExportPdfRequest) -> Response:
    """Render current TipTap HTML as a clean revised PDF."""
    _require_workspace(workspace_id)
    if await store.get_workspace(workspace_id) is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    try:
        payload = await asyncio.to_thread(render_pdf, req.html, req.document_name)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    filename = safe_pdf_filename(req.document_name)
    return Response(
        content=payload,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
