"""Deterministic DOCX injection and PDF form/coordinate imprinting."""
from __future__ import annotations

import io
from pathlib import Path
import fitz
from backend.models.document_contracts import TemplateProfile


class TemplateError(ValueError):
    """Raised when a reviewed template cannot safely receive a value."""


class TemplateEngine:
    """Preserves template assets and refuses unmapped or overflowing values."""

    def render_docx(self, source: str | Path, template: TemplateProfile, values: dict[str, str]) -> bytes:
        try:
            from docx import Document
        except ImportError as exc:
            raise TemplateError("python-docx is required for DOCX output") from exc
        doc = Document(str(source))
        paragraphs = list(doc.paragraphs) + [p for table in doc.tables for row in table.rows for cell in row.cells for p in cell.paragraphs]
        for field in template.fields:
            if not field.token:
                continue
            value = self._value(field.field_id, values)
            for paragraph in paragraphs:
                if field.token in paragraph.text:
                    for run in paragraph.runs:
                        run.text = run.text.replace(field.token, value)
        output = io.BytesIO()
        doc.save(output)
        return output.getvalue()

    def render_pdf(self, source: str | Path, template: TemplateProfile, values: dict[str, str], flatten: bool = True) -> bytes:
        source_path = Path(source)
        if source_path.stat().st_size > 100 * 1024 * 1024:  # 100MB safety limit
            raise TemplateError("PDF file exceeds 100MB safety limit")
        source_bytes = source_path.read_bytes()
        probe = fitz.open(stream=source_bytes, filetype="pdf")
        if probe.needs_pass:
            probe.close()
            raise TemplateError("Encrypted PDFs cannot be safely imprinted")
        probe.close()
        if template.format.lower() == "acroform":
            return self._fill_form(source_bytes, template, values, flatten)
        return self._imprint(source_bytes, template, values)

    def _fill_form(self, source: bytes, template: TemplateProfile, values: dict[str, str], flatten: bool) -> bytes:
        try:
            from pypdf import PdfReader, PdfWriter
        except ImportError as exc:
            raise TemplateError("pypdf is required for PDF form output") from exc
        reader = PdfReader(io.BytesIO(source))
        fields = reader.get_fields() or {}
        expected = {f.field_id: self._value(f.field_id, values) for f in template.fields}
        missing = sorted(set(expected) - set(fields))
        if missing:
            raise TemplateError(f"AcroForm fields not found: {', '.join(missing)}")
        writer = PdfWriter()
        writer.clone_document_from_reader(reader)
        writer.update_page_form_field_values(None, expected, auto_regenerate=False, flatten=flatten)
        output = io.BytesIO()
        writer.write(output)
        return output.getvalue()

    def _imprint(self, source: bytes, template: TemplateProfile, values: dict[str, str]) -> bytes:
        doc = fitz.open(stream=source, filetype="pdf")
        for field in template.fields:
            value = self._value(field.field_id, values)
            if field.page is None or None in (field.x, field.y, field.width, field.height):
                raise TemplateError(f"Field '{field.field_id}' has no reviewed PDF coordinates")
            if field.max_chars and len(value) > field.max_chars:
                raise TemplateError(f"Field '{field.field_id}' exceeds its maximum length")
            rect = fitz.Rect(field.x, field.y, field.x + field.width, field.y + field.height)
            page = doc[field.page - 1]
            placed = page.insert_textbox(rect, value, fontsize=field.font_size, fontname="helv", color=(0, 0, 0), overlay=True)
            if placed < 0:
                raise TemplateError(f"Field '{field.field_id}' does not fit its reviewed box")
        output = io.BytesIO()
        doc.save(output)
        doc.close()
        return output.getvalue()

    def _value(self, field_id: str, values: dict[str, str]) -> str:
        value = values.get(field_id)
        if value is None:
            raise TemplateError(f"Required template value missing: {field_id}")
        return str(value)
