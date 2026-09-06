"""Comprehensive empirical stress tests for Tender Router, ComplianceEngine, and RLock concurrency."""
from __future__ import annotations

import concurrent.futures
import json
import threading
from typing import Any
import pytest
from fastapi.testclient import TestClient

from backend.api.tender_router import router as tender_router
from backend.engine.compliance_engine import ComplianceEngine
from backend.engine.singleton_registry import get_singleton, _INSTANCES, _LOCK
from backend.main import app
from backend.models.document_contracts import ComplianceFinding, ComplianceState, EvidenceRef
from backend.models.tender_model import ComplianceIssue, ExtractedLineItem, TenderAnalysisReport


@pytest.fixture(scope="module")
def compliance_engine() -> ComplianceEngine:
    """Fixture providing singleton ComplianceEngine instance."""
    return get_singleton("compliance_engine", ComplianceEngine)


def test_compliance_engine_empty_text(compliance_engine: ComplianceEngine) -> None:
    """Case 1A: Empty text / no items extracted should produce compliant empty report with export blocked."""
    report, run = compliance_engine.analyze(text="", document_name="empty_test.txt")
    
    assert report.document_name == "empty_test.txt"
    assert report.extracted_items_count == 0
    assert len(report.items) == 0
    assert len(report.compliance_issues) == 0
    assert len(report.findings) == 0
    assert report.overall_state == ComplianceState.COMPLIANT
    assert report.mandatory_standards == []
    assert report.mandatory_qco_coverage == 0.0
    assert run.export_blocked is True
    assert run.run_id == report.compliance_run_id


def test_compliance_engine_whitespace_only(compliance_engine: ComplianceEngine) -> None:
    """Case 1A-bis: Whitespace-only text should safely return zero items."""
    report, run = compliance_engine.analyze(text="   \n\n\t  \n  ", document_name="spaces.txt")
    assert report.extracted_items_count == 0
    assert len(report.items) == 0
    assert report.overall_state == ComplianceState.COMPLIANT


def test_compliance_engine_multi_line_domain_items(compliance_engine: ComplianceEngine) -> None:
    """Case 1B: Multiple line items with real domain standards (TMT bars, Solar PV, Transformers)."""
    text = (
        "ITEM 1: Supply of High Strength Deformed Steel Bars for Concrete Reinforcement TMT Fe 500D per IS 1786.\n"
        "Bidders must provide valid BIS ISI certification.\n\n"
        "ITEM 2: Supply of Crystalline Silicon Terrestrial Photovoltaic PV Modules 400W as per IS 14286.\n"
        "Must comply with CRS registration scheme.\n\n"
        "ITEM 3: 11kV/433V Three Phase Outdoor Distribution Transformers energy efficient level 2 per IS 1180 Part 1.\n"
        "BIS license with BEE star rating mandatory."
    )
    report, run = compliance_engine.analyze(text=text, document_name="tender_multi_domain.txt")
    
    assert report.extracted_items_count == 3
    assert len(report.items) == 3
    assert report.compliance_run_id is not None
    assert len(report.mandatory_standards) > 0
    
    # Check that recommended standards and clauses are populated
    for item in report.items:
        assert len(item.recommended_standards) > 0
        assert item.recommended_standards[0].sample_tender_clause != ""
    
    assert "Item #1" in report.complete_spec_clause_text
    assert "Item #2" in report.complete_spec_clause_text
    assert "Item #3" in report.complete_spec_clause_text


def test_compliance_engine_statutory_qco_violations(compliance_engine: ComplianceEngine) -> None:
    """Case 1C: Text mentioning mandatory standard but omitting mandatory certification triggers QCO finding."""
    # IS 1786 (TMT steel) requires ISI / CML mark under Ministry of Steel mandatory QCO
    text = (
        "ITEM 1: 500 MT of High Strength TMT steel bars conforming to IS 1786.\n"
        "Manufacturer test certificate acceptable. Third party inspection by SGS."
    )
    report, run = compliance_engine.analyze(text=text, document_name="tmt_tender_no_isi.txt")
    
    # The text lacks 'isi' or 'cml', so ComplianceEngine must generate a Mandatory QCO finding
    qco_findings = [f for f in report.findings if f.category == "Mandatory QCO"]
    assert len(qco_findings) > 0, "Expected statutory QCO finding for omitted ISI mark requirement"
    assert any(f.severity == "HIGH" for f in qco_findings)
    assert any(f.state == ComplianceState.NON_COMPLIANT for f in qco_findings)
    assert report.overall_state == ComplianceState.NON_COMPLIANT
    assert run.export_blocked is True


def test_compliance_engine_pre_extracted_items_and_issues(compliance_engine: ComplianceEngine) -> None:
    """Case 1D: Passing pre-extracted items and issues bypasses heuristic extraction and preserves inputs."""
    custom_items = [
        ExtractedLineItem(
            item_id=101,
            product_title="Custom Distribution Transformer 250kVA",
            spec_summary="Three phase transformer 11kV per IS 1180 Part 1 with ISI Mark and BEE Star Rating",
            cited_standards=["IS 1180 (Part 1):2014"],
            outdated_citations=[],
        )
    ]
    custom_issues = [
        ComplianceIssue(
            severity="MEDIUM",
            category="Warranty Ambiguity",
            issue_text="Defect liability clause specifies only 6 months instead of 36 months",
            corrective_action="Extend warranty to 36 months per CPWD guidelines",
        )
    ]
    
    report, run = compliance_engine.analyze(
        text="raw text here",
        document_name="pre_extracted.txt",
        items=custom_items,
        issues=custom_issues,
    )
    
    assert report.extracted_items_count == 1
    assert report.items[0].item_id == 101
    assert report.items[0].product_title == "Custom Distribution Transformer 250kVA"
    assert len(report.compliance_issues) == 1
    assert report.compliance_issues[0].category == "Warranty Ambiguity"
    
    # Medium severity issue maps to NEEDS_VERIFICATION finding
    finding_1 = report.findings[0]
    assert finding_1.finding_id == "finding-1"
    assert finding_1.state == ComplianceState.NEEDS_VERIFICATION
    assert finding_1.category == "Warranty Ambiguity"


def test_tender_analysis_report_serialization() -> None:
    """Case 2A: TenderAnalysisReport serialization with model_dump and model_dump_json."""
    item = ExtractedLineItem(
        item_id=1,
        product_title="Solar Photovoltaic Module 330W",
        spec_summary="Crystalline silicon module tested to IS 14286",
        cited_standards=["IS 14286"],
        outdated_citations=[],
        recommended_standards=[],
    )
    finding = ComplianceFinding(
        finding_id="f-1",
        category="Statutory QCO",
        severity="HIGH",
        state=ComplianceState.NON_COMPLIANT,
        message="Missing CRS registration number requirement",
        corrective_action="Mandate valid BIS CRS R-number in bid criteria",
        evidence=[EvidenceRef(source="gazette", locator="MeitY QCO Order")],
    )
    report = TenderAnalysisReport(
        document_name="solar_tender.pdf",
        extracted_items_count=1,
        items=[item],
        compliance_issues=[],
        mandatory_qco_coverage=85.5,
        complete_spec_clause_text="Clause 4.1: BIS compliance",
        raw_text="Raw tender text",
        findings=[finding],
        overall_state=ComplianceState.NON_COMPLIANT,
        mandatory_standards=["IS 14286"],
        compliance_run_id="run-uuid-12345",
    )
    
    # Test model_dump
    dumped = report.model_dump()
    assert isinstance(dumped, dict)
    assert dumped["document_name"] == "solar_tender.pdf"
    assert dumped["overall_state"] == "NON_COMPLIANT"
    assert dumped["mandatory_standards"] == ["IS 14286"]
    assert dumped["compliance_run_id"] == "run-uuid-12345"
    assert len(dumped["findings"]) == 1
    assert dumped["findings"][0]["finding_id"] == "f-1"
    assert dumped["findings"][0]["evidence"][0]["source"] == "gazette"
    
    # Test model_dump_json
    dumped_json = report.model_dump_json()
    assert isinstance(dumped_json, str)
    parsed = json.loads(dumped_json)
    assert parsed["document_name"] == "solar_tender.pdf"
    assert parsed["overall_state"] == "NON_COMPLIANT"
    assert parsed["mandatory_standards"] == ["IS 14286"]
    assert parsed["compliance_run_id"] == "run-uuid-12345"
    
    # Test round-trip deserialization
    reconstructed = TenderAnalysisReport.model_validate_json(dumped_json)
    assert reconstructed.document_name == report.document_name
    assert reconstructed.overall_state == report.overall_state
    assert reconstructed.findings[0].finding_id == "f-1"


def test_tender_analysis_report_backward_compatibility() -> None:
    """Case 2B: Backward-compatibility when deserializing legacy payloads omitting new fields."""
    legacy_payload: dict[str, Any] = {
        "document_name": "legacy_tender.txt",
        "extracted_items_count": 0,
        "items": [],
        "compliance_issues": [],
        "mandatory_qco_coverage": 100.0,
        "complete_spec_clause_text": "",
        "raw_text": "legacy text",
    }
    
    # Must validate cleanly with defaults for new fields
    report = TenderAnalysisReport.model_validate(legacy_payload)
    assert report.document_name == "legacy_tender.txt"
    assert report.findings == []
    assert report.overall_state == ComplianceState.COMPLIANT
    assert report.mandatory_standards == []
    assert report.compliance_run_id is None


def test_singleton_concurrency_rlock_stress() -> None:
    """Case 3: Stress-test get_singleton under high concurrency with recursive calls."""
    class LeafService:
        def __init__(self) -> None:
            self.val = 42

    class CompoundService:
        def __init__(self) -> None:
            # Recursive call inside factory while holding lock
            self.leaf = get_singleton("stress_leaf", LeafService)

    created_instances: list[CompoundService] = []
    errors: list[Exception] = []

    def worker(worker_id: int) -> None:
        try:
            # Test rapid concurrent access to nested singletons
            svc = get_singleton(f"stress_compound_{worker_id % 5}", CompoundService)
            created_instances.append(svc)
        except Exception as exc:
            errors.append(exc)

    # Launch 50 concurrent threads
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(worker, i) for i in range(50)]
        concurrent.futures.wait(futures, timeout=10.0)

    assert len(errors) == 0, f"Encountered concurrency errors: {errors}"
    assert len(created_instances) == 50
    # Clean up stress instances
    with _LOCK:
        for k in list(_INSTANCES.keys()):
            if k.startswith("stress_"):
                del _INSTANCES[k]


def test_tender_router_api_endpoint() -> None:
    """Case 4: End-to-end FastAPI test client on /api/v1/analyze-tender."""
    client = TestClient(app)
    
    # 4A: Analyze text payload
    payload = {
        "raw_text": "Item 1: 500 units of LED street lights 120W.\n\nItem 2: 50 units of fire extinguishers ABC type."
    }
    res = client.post("/api/v1/analyze-tender", data=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["extracted_items_count"] == 2
    assert "findings" in data
    assert "overall_state" in data
    assert "mandatory_standards" in data
    assert "compliance_run_id" in data
    assert data["compliance_run_id"] is not None

    # 4B: Analyze empty text payload
    res_empty = client.post("/api/v1/analyze-tender", data={"raw_text": ""})
    assert res_empty.status_code == 200
    data_empty = res_empty.json()
    assert data_empty["extracted_items_count"] == 0
    assert data_empty["findings"] == []
    assert data_empty["overall_state"] == "COMPLIANT"
