"""Tests for safe workspace artifacts, revisions, and template output."""
from __future__ import annotations

import asyncio
from pathlib import Path
import fitz
from backend.engine.artifact_store import ArtifactStore
from backend.engine.revision_engine import RevisionEngine
from backend.engine.template_engine import TemplateEngine, TemplateError
from backend.engine.gpu_policy import require_cuda
from backend.engine.workspace_store import WorkspaceStore
from backend.models.document_contracts import ComplianceRun, Revision, TemplateField, TemplateProfile
from backend.models.tender_model import ExtractedLineItem, TenderAnalysisReport


def test_artifact_store_sanitizes_names(tmp_path: Path) -> None:
    path, digest = asyncio.run(ArtifactStore(tmp_path).save("w1", "../draft tender.pdf", b"x"))
    assert Path(path).parent.name == "w1"
    assert Path(path).name.endswith("_draft_tender.pdf")
    assert len(digest) == 64


def test_static_pdf_imprint_requires_coordinates(tmp_path: Path) -> None:
    source = tmp_path / "source.pdf"
    doc = fitz.open()
    doc.new_page(width=300, height=200)
    doc.save(source)
    doc.close()
    profile = TemplateProfile(template_id="t", name="t", source="upload", format="static_pdf", fields=[TemplateField(field_id="title", label="Title")])
    try:
        TemplateEngine().render_pdf(source, profile, {"title": "Tender"})
    except TemplateError as exc:
        assert "coordinates" in str(exc)
    else:
        raise AssertionError("unmapped PDF field must block output")


def test_revision_appends_grounded_clauses() -> None:
    item = ExtractedLineItem(item_id=1, product_title="Steel", spec_summary="IS 1786:1985", cited_standards=["IS 1786:1985"], outdated_citations=["IS 1786:1985 (Superseded by IS 1786:2008)"])
    report = TenderAnalysisReport(document_name="x.txt", extracted_items_count=1, items=[item], complete_spec_clause_text="IS 1786:2008 clause")
    revision = RevisionEngine().propose("IS 1786:1985", report, ComplianceRun(run_id="r"))
    assert "IS 1786:2008 clause" in revision.text
    assert revision.changes


def test_workspace_store_persists_audit_history(tmp_path: Path) -> None:
    async def scenario() -> dict[str, object] | None:
        store = WorkspaceStore(tmp_path)
        workspace_id = await store.create("Tender")
        await store.add_document(workspace_id, "draft.txt", str(tmp_path / "draft.txt"), "a" * 64, "Item 1")
        await store.save_run(workspace_id, ComplianceRun(run_id="run-1"))
        await store.save_revision(workspace_id, Revision(revision_id="rev-1", text="draft"))
        return await store.get_workspace(workspace_id)

    result = asyncio.run(scenario())
    assert result is not None
    assert result["name"] == "Tender"
    assert len(result["documents"]) == 1


def test_cuda_policy_targets_configured_device() -> None:
    result = require_cuda()
    assert result["required"] is True
    assert result["device"] == "cuda:0"
