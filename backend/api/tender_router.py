"""Router for tender document parsing and compliance auditing."""
from __future__ import annotations

import asyncio
from pathlib import Path
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from backend.config.settings import app_settings
from backend.engine.compliance_engine import ComplianceEngine
from backend.engine.singleton_registry import get_singleton
from backend.models.tender_model import ComplianceIssue, ExtractedLineItem, TenderAnalysisReport
from backend.parsers.document_parser import DocumentParser
from backend.parsers.llm_spec_extractor import LlmSpecExtractor

router = APIRouter(prefix="/api/v1", tags=["tenders"])

doc_parser = DocumentParser()
compliance_engine = get_singleton("compliance_engine", ComplianceEngine)


@router.post("/analyze-tender", response_model=TenderAnalysisReport)
async def analyze_tender(
    file: UploadFile | None = File(None),
    raw_text: str | None = Form(None),
    use_llm: bool = Form(False),
) -> TenderAnalysisReport:
    """Analyze tender document or text for Indian Standard compliance."""
    doc_name = "raw_tender_text.txt"
    text_content = ""

    if file and file.filename:
        doc_name = Path(file.filename).name
        upload_dir = Path(app_settings.storage.upload_dir)
        upload_dir.mkdir(parents=True, exist_ok=True)
        dest_path = upload_dir / doc_name
        content = await file.read()
        if len(content) > 200 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File exceeds 200MB limit")

        def write_file() -> None:
            with open(dest_path, "wb") as f:
                f.write(content)

        await asyncio.to_thread(write_file)
        text_content = await asyncio.to_thread(doc_parser.extract_text_from_file, dest_path)
    elif raw_text:
        text_content = raw_text

    items: list[ExtractedLineItem] | None = None
    issues: list[ComplianceIssue] | None = None

    if use_llm and text_content.strip():
        llm_extractor = LlmSpecExtractor()
        items = await llm_extractor.extract_items(text_content)
        issues = llm_extractor.identify_compliance_issues(items)

    report, _ = await asyncio.to_thread(
        compliance_engine.analyze,
        text=text_content,
        document_name=doc_name,
        items=items,
        issues=issues,
    )
    return report

