"""Contracts for workspace, template, compliance, and export workflows."""
from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class ComplianceState(str, Enum):
    """Evidence-based result used by the document gate."""
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    NEEDS_VERIFICATION = "NEEDS_VERIFICATION"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class EvidenceRef(BaseModel):
    """Location and provenance for a claim in an input document or dataset."""
    source: str
    locator: str = ""
    page: int | None = None
    snippet: str = ""
    confidence: float = 1.0


class ComplianceFinding(BaseModel):
    """Reviewable compliance finding with a deterministic state."""
    finding_id: str
    category: str
    severity: str
    state: ComplianceState
    message: str
    corrective_action: str = ""
    source_text: str = ""
    clause_location: str = ""
    evidence: list[EvidenceRef] = Field(default_factory=list)


class ComplianceRun(BaseModel):
    """Persisted result of one deterministic tender audit."""
    run_id: str
    dataset_label: str = "bundled_bis_standards_v1"
    dataset_version: str = "unknown"
    findings: list[ComplianceFinding] = Field(default_factory=list)
    coverage: float = 0.0
    export_blocked: bool = True


class TemplateField(BaseModel):
    """A reviewed destination for one generated tender value."""
    field_id: str
    label: str
    value_type: str = "text"
    required: bool = True
    page: int | None = None
    x: float | None = None
    y: float | None = None
    width: float | None = None
    height: float | None = None
    token: str | None = None
    max_chars: int | None = None
    font_size: float = 9.0


class TemplateProfile(BaseModel):
    """Versioned template metadata shared by DOCX and PDF injectors."""
    template_id: str
    name: str
    source: str
    version: str = "1"
    format: str
    asset_path: str | None = None
    approved: bool = False
    fields: list[TemplateField] = Field(default_factory=list)


class Revision(BaseModel):
    """Immutable proposed or approved workspace revision."""
    revision_id: str
    parent_revision_id: str | None = None
    status: str = "PROPOSED"
    text: str = ""
    changes: list[str] = Field(default_factory=list)


class ExportRequest(BaseModel):
    """Requested output format and values for a reviewed template."""
    format: str
    template: TemplateProfile
    values: dict[str, str] = Field(default_factory=dict)
    revision_id: str | None = None
    allow_draft: bool = False


class ExportPdfRequest(BaseModel):
    """Sanitized editor content submitted for regenerated PDF output."""
    html: str
    document_name: str = "tender.pdf"


class PdfEdit(BaseModel):
    """Single text replacement to apply on the original PDF."""
    source_text: str
    replacement_text: str
    finding_id: str | None = None


class ApplyEditsRequest(BaseModel):
    """Batch of edits to apply to the workspace's original PDF."""
    edits: list[PdfEdit]
    document_name: str = "tender.pdf"


class ApplyEditsResponse(BaseModel):
    """Result of applying edits to the original PDF."""
    pdf_url: str
    page_count: int
    file_size: int
    edits_applied: int
    edits_failed: list[str] = Field(default_factory=list)


class CompilePreviewRequest(BaseModel):
    """Request to compile a preview PDF with pending edits."""
    html: str
    document_name: str = "tender.pdf"
    edits: list[PdfEdit] = Field(default_factory=list)
