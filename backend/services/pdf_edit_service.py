"""Surgical PDF text replacement using PyMuPDF redaction API."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import fitz

from backend.logger.app_logger import get_logger

logger = get_logger("services.pdf_edit_service")


def _normalize_search_text(text: str) -> str:
    """Normalize whitespace for fuzzy matching without changing content."""
    return re.sub(r"\s+", " ", text.strip())


def apply_edits_to_pdf(
    pdf_path: str,
    edits: list[dict[str, str]],
) -> tuple[bytes, int, list[str]]:
    """Apply text replacements to an existing PDF, preserving structure.

    Args:
        pdf_path: Absolute path to the original PDF file.
        edits: List of dicts with 'source_text' and 'replacement_text' keys.

    Returns:
        Tuple of (edited_pdf_bytes, edits_applied_count, failed_edit_descriptions).
    """
    source = Path(pdf_path)
    if not source.is_file():
        raise FileNotFoundError(f"Original PDF not found: {pdf_path}")

    doc = fitz.open(str(source))
    edits_applied = 0
    edits_failed: list[str] = []

    for edit in edits:
        source_text = edit.get("source_text", "").strip()
        replacement_text = edit.get("replacement_text", "").strip()
        if not source_text:
            edits_failed.append("Empty source text")
            continue

        found = _apply_single_edit(doc, source_text, replacement_text)
        if found:
            edits_applied += 1
        else:
            edits_failed.append(f"Text not found: {source_text[:80]}...")

    pdf_bytes = doc.tobytes(deflate=True, garbage=4)
    doc.close()
    return pdf_bytes, edits_applied, edits_failed


def _apply_single_edit(
    doc: Any,
    source_text: str,
    replacement_text: str,
) -> bool:
    """Find and replace text across all pages of the document.

    Uses PyMuPDF's redaction API to remove original text and insert
    replacement at the same position, preserving page layout.
    """
    normalized_source = _normalize_search_text(source_text)
    found_any = False

    for page_num in range(len(doc)):
        page = doc[page_num]
        search_variants = _build_search_variants(normalized_source)

        for variant in search_variants:
            instances = page.search_for(variant, quads=False)
            if not instances:
                continue

            found_any = True
            font_size = _detect_font_size(page, instances[0])

            for rect in instances:
                page.add_redact_annot(
                    rect,
                    text="",
                    fontsize=0,
                    fill=(1, 1, 1),
                )

            page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

            if replacement_text and instances:
                target_rect = instances[0]
                _insert_replacement_text(
                    page, target_rect, replacement_text, font_size
                )
            break

    return found_any


def _build_search_variants(normalized_text: str) -> list[str]:
    """Build search variants from full text down to first sentence."""
    variants = [normalized_text]
    if len(normalized_text) > 120:
        variants.append(normalized_text[:120])
    first_sentence_end = normalized_text.find(".")
    if first_sentence_end > 20:
        variants.append(normalized_text[: first_sentence_end + 1])
    return variants


def _detect_font_size(page: Any, rect: Any) -> float:
    """Detect the font size of text in a given rectangle."""
    try:
        blocks = page.get_text("dict", clip=rect).get("blocks", [])
        for block in blocks:
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    size = span.get("size", 0)
                    if size > 0:
                        return size
    except (KeyError, IndexError, RuntimeError):
        pass
    return 10.0


def _insert_replacement_text(
    page: Any,
    target_rect: Any,
    text: str,
    font_size: float,
) -> None:
    """Insert replacement text into the target rectangle area.

    Uses insert_htmlbox to support markdown tables and formatting.
    """
    try:
        import markdown
        html_text = markdown.markdown(text, extensions=["extra", "tables", "sane_lists"])
        css = f"body {{ font-family: sans-serif; font-size: {font_size}px; line-height: 1.2; margin: 0; padding: 0; }}"
        html_content = f"<!DOCTYPE html><html><head><style>{css}</style></head><body>{html_text}</body></html>"
        
        expanded = fitz.Rect(
            target_rect.x0,
            target_rect.y0,
            page.rect.width - 40,
            page.rect.height - 40,
        )
        page.insert_htmlbox(
            expanded,
            html_content,
        )
    except Exception as exc:
        logger.warning(f"HTMLBox insertion failed, falling back to insert_text: {exc}")
        try:
            point = fitz.Point(target_rect.x0, target_rect.y1)
            page.insert_text(
                point,
                text,
                fontsize=font_size,
                fontname="helv",
                color=(0, 0, 0),
                overlay=True,
            )
        except Exception as fallback_exc:
            logger.error(f"Text insertion failed entirely: {fallback_exc}")


def get_pdf_page_count(pdf_path: str) -> int:
    """Return the page count of a PDF file."""
    doc = fitz.open(str(pdf_path))
    count = doc.page_count
    doc.close()
    return count
