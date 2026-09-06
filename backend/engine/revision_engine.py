"""Creates immutable, reviewable corrected tender revisions."""
from __future__ import annotations

import re
from uuid import uuid4
from backend.models.document_contracts import ComplianceRun, Revision
from backend.models.tender_model import TenderAnalysisReport


class RevisionEngine:
    """Applies only deterministic citation corrections and generated clauses."""

    def propose(self, original_text: str, report: TenderAnalysisReport, run: ComplianceRun) -> Revision:
        corrected = original_text
        changes: list[str] = []
        for item in report.items:
            for outdated in item.outdated_citations:
                match = re.search(r"(IS\s+\d+(?:\s*\([^)]*\))?)", outdated, re.IGNORECASE)
                if not match:
                    continue
                old_code = match.group(1)
                replacement = self._replacement(item, old_code)
                if replacement and old_code.lower() in corrected.lower():
                    corrected = re.sub(re.escape(old_code), replacement, corrected, flags=re.IGNORECASE)
                    changes.append(f"Updated {old_code} to {replacement} for item {item.item_id}.")
        if report.complete_spec_clause_text:
            corrected = f"{corrected.rstrip()}\n\n{report.complete_spec_clause_text}"
            changes.append("Appended generated BIS specification clauses for review.")
        if not changes and run.findings:
            changes.append("No deterministic edit was safe; officer review is required.")
        return Revision(revision_id=str(uuid4()), text=corrected, changes=changes)

    def _replacement(self, item: object, old_code: str) -> str | None:
        for rec in getattr(item, "recommended_standards", []):
            std = rec.standard
            if std.is_code.lower() != old_code.lower() and std.superseded_by:
                return std.superseded_by
        return None
