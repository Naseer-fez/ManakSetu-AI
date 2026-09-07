"""Unit tests for PdfMarkdownParser using PyMuPDF4LLM."""
from __future__ import annotations
import os
import fitz
import pytest
from backend.parsers.pdf_markdown_parser import PdfMarkdownParser


def test_pdf_markdown_parser_empty_bytes() -> None:
    """Test extracting from empty bytes."""
    parser = PdfMarkdownParser()
    result = parser.extract_markdown_from_bytes(b"")
    assert result == ""


def test_pdf_markdown_parser_missing_path() -> None:
    """Test handling of non-existent file path."""
    parser = PdfMarkdownParser()
    result = parser.extract_markdown_from_path("non_existent_file.pdf")
    assert result == ""


def test_pdf_markdown_parser_valid_pdf(tmp_path: pytest.TempPathFactory) -> None:
    """Test extracting text as markdown from a real PDF generated via PyMuPDF."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "# Specification for Cement IS 269\nGrade 53 Ordinary Portland Cement")
    pdf_bytes = doc.tobytes()
    doc.close()

    parser = PdfMarkdownParser()
    markdown = parser.extract_markdown_from_bytes(pdf_bytes)

    assert "Specification for Cement" in markdown or "IS 269" in markdown


def test_pdf_markdown_parser_md_bytes() -> None:
    """Test extracting markdown from raw UTF-8 markdown bytes."""
    parser = PdfMarkdownParser()
    raw_md = b"# IS 1786 High Strength Deformed Steel Bars\n\nGrade Fe 500D yield specifications."
    markdown = parser.extract_markdown_from_bytes(raw_md)
    assert "IS 1786" in markdown
    assert "Grade Fe 500D" in markdown


def test_pdf_markdown_parser_md_filename_hint() -> None:
    """Test extracting markdown bytes with explicit filename hint."""
    parser = PdfMarkdownParser()
    raw_md = b"## Clause 4.2 Chemical Composition\n\nCarbon maximum 0.25 percent."
    markdown = parser.extract_markdown_from_bytes(raw_md, filename="tender_spec.md")
    assert "Clause 4.2" in markdown
    assert "Carbon maximum" in markdown


def test_pdf_markdown_parser_md_file_path(tmp_path: pytest.TempPathFactory) -> None:
    """Test reading directly from a .md file path on disk."""
    parser = PdfMarkdownParser()
    md_file = tmp_path / "sample_standards.md"
    md_file.write_text("# IS 4984 HDPE Pipes\nRequirements for potable water supplies.", encoding="utf-8")

    markdown = parser.extract_markdown_from_path(str(md_file))
    assert "IS 4984 HDPE Pipes" in markdown
    assert "potable water supplies" in markdown
