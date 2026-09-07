"""Extraction, sanitization, and PDF regeneration for the workspace editor."""
from __future__ import annotations

import html as html_lib
import re
from pathlib import Path
from typing import Any

import bleach
import markdown

MAX_EDITOR_HTML_CHARS = 2_000_000
ALLOWED_TAGS = [
    "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "em", "u", "s", "blockquote", "code", "pre",
    "ul", "ol", "li", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
]
ALLOWED_ATTRIBUTES = {"th": ["colspan", "rowspan"], "td": ["colspan", "rowspan"]}


def markdown_to_editor_html(source_markdown: str) -> str:
    """Convert extracted Markdown into the semantic HTML TipTap understands."""
    return sanitize_editor_html(
        markdown.markdown(
            source_markdown,
            extensions=["extra", "tables", "sane_lists"],
            output_format="html5",
        )
    )


def sanitize_editor_html(source_html: str) -> str:
    """Keep only editor blocks and attributes accepted by the export stylesheet."""
    if not isinstance(source_html, str) or len(source_html) > MAX_EDITOR_HTML_CHARS:
        raise ValueError("Editor HTML is empty or exceeds the 2 MB limit")
    clean = bleach.clean(
        source_html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=[],
        strip=True,
        strip_comments=True,
    ).strip()
    if not re.search(r"[A-Za-z0-9\u00c0-\uFFFF]", bleach.clean(clean, tags=[], strip=True)):
        raise ValueError("Editor HTML does not contain readable text")
    return clean


def count_words(source_text: str) -> int:
    """Return a stable word count for the extraction response."""
    return len(re.findall(r"\b\w[\w'-]*\b", source_text, flags=re.UNICODE))


def page_count(pdf_bytes: bytes) -> int:
    """Read PDF metadata with PyMuPDF without writing a temporary file."""
    import fitz

    document = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        return document.page_count
    finally:
        document.close()


def render_pdf(source_html: str, document_name: str) -> bytes:
    """Render sanitized editor HTML as a clean A4 tender PDF."""
    clean = sanitize_editor_html(source_html)
    safe_title = html_lib.escape(Path(document_name).stem[:160] or "Tender")
    print_html = f"""<!doctype html>
<html><head><meta charset="utf-8"><title>{safe_title}</title>
<style>
@page {{ size: A4; margin: 22mm 18mm 20mm; }}
* {{ box-sizing: border-box; }}
body {{ color: #172033; font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.48; }}
h1, h2, h3, h4, h5, h6 {{ color: #0f2747; line-height: 1.2; margin: 0.9em 0 0.35em; page-break-after: avoid; }}
h1 {{ font-size: 20pt; }} h2 {{ font-size: 16pt; }} h3 {{ font-size: 13pt; }}
p {{ margin: 0 0 0.65em; orphans: 3; widows: 3; }}
ul, ol {{ margin: 0.35em 0 0.8em 1.35em; }}
blockquote {{ margin: 0.7em 0; padding: 0.35em 0.8em; border-left: 3px solid #4b78a8; background: #f3f6fa; }}
pre, code {{ font-family: Consolas, monospace; font-size: 9pt; }}
pre {{ white-space: pre-wrap; background: #f4f6f8; padding: 0.6em; }}
table {{ width: 100%; border-collapse: collapse; margin: 0.9em 0 1.1em; page-break-inside: avoid; }}
th, td {{ border: 0.5pt solid #94a3b8; padding: 5pt 6pt; vertical-align: top; }}
th {{ background: #e9eff6; color: #102b4e; font-weight: 700; }}
tr {{ page-break-inside: avoid; }}
</style></head><body>{clean}</body></html>"""
    try:
        from weasyprint import HTML
    except (ImportError, OSError) as exc:
        raise RuntimeError("WeasyPrint is not installed or its native libraries are unavailable") from exc

    def blocked_url_fetcher(url: str, timeout: int = 10, ssl_context: Any = None) -> dict[str, Any]:
        raise ValueError(f"External resources are blocked: {url}")

    try:
        return HTML(string=print_html, url_fetcher=blocked_url_fetcher).write_pdf()
    except (OSError, RuntimeError, ValueError) as exc:
        raise RuntimeError("WeasyPrint could not render the edited document") from exc


def safe_pdf_filename(document_name: str) -> str:
    """Build an ASCII attachment name without allowing path traversal."""
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", Path(document_name).stem).strip("-._") or "tender"
    return f"{stem[:120]}-revised.pdf"
