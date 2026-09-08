"""Integration tests for PDF endpoints in workspace_router."""
from __future__ import annotations

import io
import fitz
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def _make_test_pdf_bytes() -> bytes:
    """Generate in-memory sample PDF bytes with procurement clauses."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    clause_text = (
        "SPECIFICATION DOCUMENT FOR STRUCTURAL WORK\n\n"
        "1. Material Requirements:\n"
        "Clause 1.1: Cement shall be Grade 43 Ordinary Portland Cement.\n"
        "Clause 1.2: Reinforcement bars shall be mild steel Grade 1."
    )
    page.insert_textbox(fitz.Rect(40, 40, 500, 300), clause_text, fontsize=10, fontname="helv")
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_workspace_pdf_endpoints_workflow() -> None:
    """Test full cycle: create workspace, extract, serve original, apply edits, serve revised."""
    create_res = client.post("/api/v1/workspaces", json={"name": "PDF Integration Test"})
    assert create_res.status_code == 201
    ws_id = create_res.json()["workspace_id"]

    pdf_bytes = _make_test_pdf_bytes()
    extract_res = client.post(
        f"/api/v1/workspaces/{ws_id}/extract",
        files={"file": ("tender_spec.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert extract_res.status_code == 200
    extracted_data = extract_res.json()
    assert extracted_data["page_count"] == 1

    orig_res = client.get(f"/api/v1/workspaces/{ws_id}/pdf?version=original")
    assert orig_res.status_code == 200
    assert orig_res.headers["content-type"] == "application/pdf"
    assert len(orig_res.content) > 0

    apply_payload = {
        "document_name": "tender_spec.pdf",
        "edits": [
            {
                "source_text": "Clause 1.1: Cement shall be Grade 43 Ordinary Portland Cement.",
                "replacement_text": "Clause 1.1: Cement shall conform to IS 269 Grade 53 OPC.",
            }
        ],
    }
    edit_res = client.post(f"/api/v1/workspaces/{ws_id}/apply-edits", json=apply_payload)
    assert edit_res.status_code == 200
    edit_data = edit_res.json()
    assert edit_data["edits_applied"] == 1
    assert "revised" in edit_data["pdf_url"]

    revised_res = client.get(f"/api/v1/workspaces/{ws_id}/pdf?version=revised")
    assert revised_res.status_code == 200
    assert revised_res.headers["content-type"] == "application/pdf"
    assert len(revised_res.content) > 0

    revised_doc = fitz.open(stream=revised_res.content, filetype="pdf")
    revised_text = revised_doc[0].get_text()
    revised_doc.close()
    assert "IS 269" in revised_text


def test_compile_preview_endpoint() -> None:
    """Test preview compilation with PyMuPDF edits."""
    create_res = client.post("/api/v1/workspaces", json={"name": "Preview Test"})
    assert create_res.status_code == 201
    ws_id = create_res.json()["workspace_id"]

    pdf_bytes = _make_test_pdf_bytes()
    client.post(
        f"/api/v1/workspaces/{ws_id}/extract",
        files={"file": ("preview_spec.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )

    preview_payload = {
        "html": "<p>Preview content</p>",
        "document_name": "preview_spec.pdf",
        "edits": [
            {
                "source_text": "Clause 1.2: Reinforcement bars shall be mild steel Grade 1.",
                "replacement_text": "Clause 1.2: Reinforcement bars shall conform to IS 1786 Fe 500D.",
            }
        ],
    }
    prev_res = client.post(f"/api/v1/workspaces/{ws_id}/compile-preview", json=preview_payload)
    assert prev_res.status_code == 200
    prev_data = prev_res.json()
    assert prev_data["edits_applied"] == 1
    assert "revised" in prev_data["pdf_url"]
