"""Unit tests for pdf_edit_service surgical PDF text editing."""
from __future__ import annotations

from pathlib import Path
import fitz
import pytest

from backend.services.pdf_edit_service import apply_edits_to_pdf, get_pdf_page_count


def _create_sample_pdf(tmp_path: Path, filename: str = "sample_tender.pdf") -> Path:
    """Create a sample PDF containing procurement clauses for testing."""
    pdf_path = tmp_path / filename
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    text = (
        "GOVERNMENT OF INDIA TENDER NOTICE\n"
        "Clause 4.1: Structural steel shall conform to ASTM A36.\n"
        "Clause 4.2: Cement grade must be 43 Grade OPC.\n"
        "Clause 4.3: Fire safety doors must meet local standards."
    )
    page.insert_textbox(fitz.Rect(50, 50, 500, 400), text, fontsize=11, fontname="helv")
    doc.save(str(pdf_path))
    doc.close()
    return pdf_path


def test_apply_edits_replaces_target_text(tmp_path: Path) -> None:
    """Verify that apply_edits_to_pdf replaces the target text in the PDF."""
    pdf_path = _create_sample_pdf(tmp_path)
    edits = [
        {
            "source_text": "Clause 4.1: Structural steel shall conform to ASTM A36.",
            "replacement_text": "Clause 4.1: Structural steel shall conform to IS 2062 Grade E250.",
        }
    ]

    edited_bytes, applied, failed = apply_edits_to_pdf(str(pdf_path), edits)

    assert applied == 1
    assert len(failed) == 0
    assert len(edited_bytes) > 0

    doc = fitz.open(stream=edited_bytes, filetype="pdf")
    page_text = doc[0].get_text()
    doc.close()

    assert "IS 2062" in page_text


def test_apply_edits_reports_unmatched_text(tmp_path: Path) -> None:
    """Verify that non-existent text is accurately reported in failed edits list."""
    pdf_path = _create_sample_pdf(tmp_path)
    edits = [
        {
            "source_text": "Non-existent clause that is nowhere in the PDF document.",
            "replacement_text": "Replacement clause text.",
        }
    ]

    edited_bytes, applied, failed = apply_edits_to_pdf(str(pdf_path), edits)

    assert applied == 0
    assert len(failed) == 1
    assert "Text not found" in failed[0]
    assert len(edited_bytes) > 0


def test_apply_edits_handles_empty_source(tmp_path: Path) -> None:
    """Verify that edits with empty source text are gracefully skipped."""
    pdf_path = _create_sample_pdf(tmp_path)
    edits = [
        {
            "source_text": "   ",
            "replacement_text": "Some text",
        }
    ]

    edited_bytes, applied, failed = apply_edits_to_pdf(str(pdf_path), edits)

    assert applied == 0
    assert len(failed) == 1
    assert "Empty source text" in failed[0]


def test_apply_edits_raises_on_missing_file() -> None:
    """Verify that a missing PDF raises FileNotFoundError."""
    with pytest.raises(FileNotFoundError):
        apply_edits_to_pdf("non_existent_tender_doc.pdf", [])


def test_get_pdf_page_count(tmp_path: Path) -> None:
    """Verify page counting utility returns correct number of pages."""
    pdf_path = _create_sample_pdf(tmp_path)
    count = get_pdf_page_count(str(pdf_path))
    assert count == 1
