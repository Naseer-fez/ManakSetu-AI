"""Deterministic tender audit orchestration with truthful dataset provenance."""
from __future__ import annotations

import hashlib
from pathlib import Path
from uuid import uuid4
from backend.config.settings import app_settings
from backend.engine.certification_advisor import CertificationAdvisor
from backend.engine.hybrid_retriever import HybridRetriever
from backend.engine.normative_resolver import NormativeResolver
from backend.engine.singleton_registry import get_singleton
from backend.engine.tender_clause_generator import TenderClauseGenerator
from backend.ingestion.qco_registry import QcoRegistry
from backend.models.document_contracts import ComplianceFinding, ComplianceRun, ComplianceState, EvidenceRef
from backend.models.recommendation_model import StandardRecommendation
from backend.models.tender_model import ComplianceIssue, ExtractedLineItem, TenderAnalysisReport
from backend.parsers.spec_extractor import SpecExtractor


class ComplianceEngine:
    """Runs existing BIS retrieval/resolution services and adds export-safe findings."""

    def __init__(self) -> None:
        self.extractor = SpecExtractor()
        self.retriever = get_singleton("hybrid_retriever", HybridRetriever)
        self.resolver = get_singleton("normative_resolver", NormativeResolver)
        self.advisor = get_singleton("certification_advisor", CertificationAdvisor)
        self.qco_registry = get_singleton("qco_registry", QcoRegistry)
        self.clause_generator = get_singleton("tender_clause_generator", TenderClauseGenerator)

    def analyze(
        self,
        text: str,
        document_name: str,
        items: list[ExtractedLineItem] | None = None,
        issues: list[ComplianceIssue] | None = None,
    ) -> tuple[TenderAnalysisReport, ComplianceRun]:
        if items is None:
            items = self.extractor.split_into_items(text)
        if issues is None:
            issues = self.extractor.identify_compliance_issues(items)
        coverage_count = 0
        findings: list[ComplianceFinding] = []
        item_by_id = {item.item_id: item for item in items}
        for idx, iss in enumerate(issues, start=1):
            st = ComplianceState.NON_COMPLIANT if iss.severity == "HIGH" else ComplianceState.NEEDS_VERIFICATION
            source_item = item_by_id.get(iss.item_id) if iss.item_id is not None else None
            findings.append(ComplianceFinding(
                finding_id=f"finding-{idx}", category=iss.category, severity=iss.severity, state=st,
                message=iss.issue_text, corrective_action=iss.corrective_action,
                source_text=source_item.source_text if source_item else "",
                clause_location=f"Item #{source_item.item_id}" if source_item else "",
                evidence=[EvidenceRef(source="uploaded_document", locator=document_name, snippet=source_item.source_text if source_item else "")],
            ))
        mandatory_stds: list[str] = []
        for item in items:
            item.recommended_standards = []
            matches = self.retriever.search(query=f"{item.product_title} {item.spec_summary}", top_k=2)
            for std, score, reasons in matches:
                reg_qco = self.qco_registry.get_qco_for_standard(std.is_code)
                eff_qco = reg_qco if reg_qco.is_mandatory else std.mandatory_qco
                if eff_qco.is_mandatory and std.is_code not in mandatory_stds:
                    mandatory_stds.append(std.is_code)
                item.recommended_standards.append(StandardRecommendation(
                    standard=std, relevance_score=round(score, 4), match_reasons=reasons,
                    allied_standards=self.resolver.resolve_allied(std),
                    certification_alert=self.advisor.get_certification_alert(std),
                    deprecation_warning=self.resolver.check_deprecation(std),
                    sample_tender_clause=self.clause_generator.generate_clause(std.model_copy(update={"mandatory_qco": eff_qco})),
                ))
                if eff_qco.is_mandatory:
                    req_tokens = ("isi", "cml") if "ISI" in eff_qco.scheme.value else ("crs", "r-") if "CRS" in eff_qco.scheme.value else ("bee",)
                    if not any(t in item.spec_summary.lower() for t in req_tokens):
                        findings.append(ComplianceFinding(
                            finding_id=f"qco-{len(findings) + 1}", category="Mandatory QCO", severity="HIGH",
                            state=ComplianceState.NON_COMPLIANT, message=f"{std.is_code} is mandatory under {eff_qco.scheme.value}, but tender lacks certification req.",
                            corrective_action=eff_qco.clause_requirement,
                            source_text=item.source_text,
                            clause_location=f"Item #{item.item_id}",
                            evidence=[EvidenceRef(source="bundled:qco_registry", locator=std.is_code, snippet=eff_qco.clause_requirement)],
                        ))
            if item.recommended_standards and (
                self.qco_registry.get_qco_for_standard(item.recommended_standards[0].standard.is_code).is_mandatory
                or item.recommended_standards[0].standard.mandatory_qco.is_mandatory
            ):
                coverage_count += 1
        coverage = round(coverage_count / max(len(items), 1) * 100, 1)
        overall_state = (
            ComplianceState.NON_COMPLIANT if any(f.state == ComplianceState.NON_COMPLIANT for f in findings)
            else ComplianceState.NEEDS_VERIFICATION if any(f.state == ComplianceState.NEEDS_VERIFICATION for f in findings)
            else ComplianceState.COMPLIANT
        )
        run_id = str(uuid4())
        run = ComplianceRun(
            run_id=run_id, findings=findings, coverage=coverage, dataset_version=self._dataset_version(),
            export_blocked=not items or any(f.state != ComplianceState.COMPLIANT for f in findings),
        )
        report = TenderAnalysisReport(
            document_name=document_name, extracted_items_count=len(items), items=items,
            compliance_issues=issues, mandatory_qco_coverage=coverage,
            complete_spec_clause_text=self._clauses(items), raw_text=text, findings=findings,
            overall_state=overall_state, mandatory_standards=mandatory_stds, compliance_run_id=run_id,
        )
        return report, run


    def _clauses(self, items: list[object]) -> str:
        return "\n\n".join(
            f"### Item #{getattr(it, 'item_id', '')}: {getattr(it, 'product_title', '')}\n{rec.sample_tender_clause}"
            for it in items for rec in getattr(it, "recommended_standards", [])
        )

    def _dataset_version(self) -> str:
        try:
            with open(Path(app_settings.storage.standards_file), "rb") as f:
                return hashlib.sha256(f.read()).hexdigest()[:16]
        except OSError:
            return "unavailable"
