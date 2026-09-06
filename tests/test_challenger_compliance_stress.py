"""Adversarial stress-test suite for ComplianceEngine, TenderRouter, serialization, and RLock concurrency."""
from __future__ import annotations

import concurrent.futures
import io
import json
import threading
import time
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
def engine() -> ComplianceEngine:
    """Fixture providing singleton ComplianceEngine instance."""
    return get_singleton("compliance_engine", ComplianceEngine)


def test_adversarial_empty_and_whitespace_inputs(engine: ComplianceEngine) -> None:
    """Test empty, whitespace, and extreme blank inputs."""
    for empty_input in ["", "   ", "\t\n\r\n   \t", "\n" * 100]:
        report, run = engine.analyze(text=empty_input, document_name="blank.txt")
        assert report.extracted_items_count == 0
        assert len(report.items) == 0
        assert len(report.compliance_issues) == 0
        assert len(report.findings) == 0
        assert report.overall_state == ComplianceState.COMPLIANT
        assert report.mandatory_standards == []
        assert report.mandatory_qco_coverage == 0.0
        assert run.export_blocked is True
        assert run.run_id == report.compliance_run_id


def test_adversarial_unicode_and_indic_text(engine: ComplianceEngine) -> None:
    """Test Unicode, Indic terms, and special characters."""
    unicode_text = (
        "आइटम 1: उच्च शक्ति टीएमटी सरिया Fe 500D per IS 1786.\n"
        "Bidders must provide valid BIS ISI certification.\n\n"
        "Item 2: Solar PV Modules tested to IS 14286 with ☀️ CRS registration ⚡."
    )
    report, run = engine.analyze(text=unicode_text, document_name="unicode_tender.txt")
    assert report.document_name == "unicode_tender.txt"
    assert report.extracted_items_count >= 1
    assert report.compliance_run_id is not None
    assert isinstance(report.overall_state, ComplianceState)


def test_adversarial_statutory_qco_violation_detection(engine: ComplianceEngine) -> None:
    """Test that missing mandatory certifications trigger HIGH severity NON_COMPLIANT findings."""
    # IS 1786 requires ISI / CML mark
    text_violating = (
        "ITEM 1: Supply of TMT Steel Bars conforming to IS 1786 for metro rail construction.\n"
        "Mill test certificates and warranty are sufficient."
    )
    report_violating, run_violating = engine.analyze(text=text_violating, document_name="qco_violation.txt")
    qco_findings = [f for f in report_violating.findings if f.category == "Mandatory QCO"]
    assert len(qco_findings) > 0, "Statutory QCO violation must be detected"
    assert any(f.severity == "HIGH" for f in qco_findings)
    assert any(f.state == ComplianceState.NON_COMPLIANT for f in qco_findings)
    assert report_violating.overall_state == ComplianceState.NON_COMPLIANT
    assert run_violating.export_blocked is True

    # Now provide the required ISI / CML certification in the specification
    text_compliant = (
        "ITEM 1: Supply of TMT Steel Bars conforming to IS 1786 for metro rail construction.\n"
        "Manufacturer must possess valid BIS license with ISI mark and CML number."
    )
    report_compliant, run_compliant = engine.analyze(text=text_compliant, document_name="qco_compliant.txt")
    compliant_qco_findings = [f for f in report_compliant.findings if f.category == "Mandatory QCO"]
    assert len(compliant_qco_findings) == 0, "No QCO violation when valid ISI/CML certification is cited"


def test_adversarial_pre_extracted_empty_and_custom_items(engine: ComplianceEngine) -> None:
    """Test passing custom empty lists and populated lists for items and issues."""
    # Test passing empty lists (items=[], issues=[])
    report_empty, run_empty = engine.analyze(
        text="ignored text",
        document_name="empty_pre.txt",
        items=[],
        issues=[],
    )
    assert report_empty.extracted_items_count == 0
    assert len(report_empty.items) == 0
    assert len(report_empty.findings) == 0
    assert run_empty.export_blocked is True

    # Test passing custom item with outdated citation
    custom_item = ExtractedLineItem(
        item_id=42,
        product_title="Distribution Transformer 500kVA",
        spec_summary="Three phase transformer per IS 1180 Part 1 with valid ISI mark",
        cited_standards=["IS 1180 (Part 1):1989"],
        outdated_citations=["IS 1180 (Part 1):1989"],
    )
    custom_issue = ComplianceIssue(
        severity="HIGH",
        category="Outdated Standard",
        issue_text="Tender cites superseded 1989 version of IS 1180",
        corrective_action="Update specification to cite IS 1180 (Part 1):2014",
    )
    report_custom, run_custom = engine.analyze(
        text="custom text",
        document_name="custom.txt",
        items=[custom_item],
        issues=[custom_issue],
    )
    assert report_custom.extracted_items_count == 1
    assert len(report_custom.findings) >= 1
    assert report_custom.findings[0].category == "Outdated Standard"
    assert report_custom.findings[0].severity == "HIGH"
    assert report_custom.findings[0].state == ComplianceState.NON_COMPLIANT
    assert report_custom.overall_state == ComplianceState.NON_COMPLIANT


def test_report_serialization_and_backward_compatibility() -> None:
    """Stress test serialization, schema generation, and backward/forward compatibility."""
    item = ExtractedLineItem(
        item_id=1,
        product_title="Photovoltaic Module 400W",
        spec_summary="Tested to IS 14286 with valid CRS registration",
        cited_standards=["IS 14286"],
        outdated_citations=[],
    )
    finding = ComplianceFinding(
        finding_id="finding-1",
        category="Statutory QCO",
        severity="HIGH",
        state=ComplianceState.NON_COMPLIANT,
        message="Missing R-number",
        corrective_action="Require CRS R-number",
        evidence=[EvidenceRef(source="gazette", locator="MeitY Order")],
    )
    report = TenderAnalysisReport(
        document_name="report.pdf",
        extracted_items_count=1,
        items=[item],
        compliance_issues=[],
        mandatory_qco_coverage=100.0,
        complete_spec_clause_text="Clause text",
        raw_text="Raw text",
        findings=[finding],
        overall_state=ComplianceState.NON_COMPLIANT,
        mandatory_standards=["IS 14286"],
        compliance_run_id="uuid-999",
    )

    # 1. model_dump dict
    dumped = report.model_dump()
    assert dumped["findings"][0]["finding_id"] == "finding-1"
    assert dumped["overall_state"] == "NON_COMPLIANT"
    assert dumped["mandatory_standards"] == ["IS 14286"]
    assert dumped["compliance_run_id"] == "uuid-999"

    # 2. model_dump_json string
    json_str = report.model_dump_json()
    assert isinstance(json_str, str)

    # 3. model_validate_json roundtrip
    restored = TenderAnalysisReport.model_validate_json(json_str)
    assert restored.document_name == report.document_name
    assert restored.overall_state == ComplianceState.NON_COMPLIANT
    assert len(restored.findings) == 1

    # 4. JSON Schema inspection
    schema = TenderAnalysisReport.model_json_schema()
    assert "findings" in schema["properties"]
    assert "overall_state" in schema["properties"]
    assert "mandatory_standards" in schema["properties"]
    assert "compliance_run_id" in schema["properties"]

    # 5. Backward compatibility with minimal legacy payload
    minimal_legacy = {
        "document_name": "old.txt",
        "extracted_items_count": 0,
    }
    legacy_model = TenderAnalysisReport.model_validate(minimal_legacy)
    assert legacy_model.findings == []
    assert legacy_model.overall_state == ComplianceState.COMPLIANT
    assert legacy_model.mandatory_standards == []
    assert legacy_model.compliance_run_id is None


def test_rlock_concurrency_stress_10_threads() -> None:
    """Stress test get_singleton with 10+ concurrent threads and nested factory recursion."""
    class DependencyC:
        def __init__(self) -> None:
            time.sleep(0.005)
            self.name = "Level-C"

    class DependencyB:
        def __init__(self) -> None:
            time.sleep(0.005)
            self.c = get_singleton("stress_nested_c", DependencyC)
            self.name = "Level-B"

    class ServiceA:
        def __init__(self) -> None:
            time.sleep(0.005)
            self.b = get_singleton("stress_nested_b", DependencyB)
            self.name = "Level-A"

    results: list[ServiceA] = []
    thread_errors: list[Exception] = []

    def task(thread_idx: int) -> None:
        try:
            # All 10 threads simultaneously request ServiceA, which recursively requests B and C
            svc = get_singleton("stress_service_a", ServiceA)
            results.append(svc)
        except Exception as exc:
            thread_errors.append(exc)

    threads = [threading.Thread(target=task, args=(i,)) for i in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=5.0)

    assert len(thread_errors) == 0, f"Thread errors occurred: {thread_errors}"
    assert len(results) == 10
    # All threads must receive the EXACT same singleton instance
    first_inst = results[0]
    for inst in results[1:]:
        assert inst is first_inst
        assert inst.b is first_inst.b
        assert inst.b.c is first_inst.b.c

    # Clean up test keys
    with _LOCK:
        for k in ["stress_service_a", "stress_nested_b", "stress_nested_c"]:
            _INSTANCES.pop(k, None)


def test_concurrent_compliance_engine_analyze(engine: ComplianceEngine) -> None:
    """Stress test concurrent execution of ComplianceEngine.analyze from 5 threads."""
    texts = [
        "Item 1: 50 MT of TMT Rebars per IS 1786 with BIS ISI mark.",
        "Item 1: 100 Solar PV Modules per IS 14286 with CRS registration.",
        "Item 1: 10 Distribution Transformers per IS 1180 Part 1 with BEE rating and ISI.",
        "Item 1: Fire Extinguishers ABC type per IS 15683 with ISI Mark.",
        "Item 1: Structural Steel Standard per IS 2062 with BIS license.",
    ]
    reports: list[TenderAnalysisReport] = []
    errors: list[Exception] = []

    def run_analysis(idx: int) -> None:
        try:
            rep, _ = engine.analyze(text=texts[idx], document_name=f"concurrent_{idx}.txt")
            reports.append(rep)
        except Exception as e:
            errors.append(e)

    threads = [threading.Thread(target=run_analysis, args=(i,)) for i in range(len(texts))]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=30.0)

    assert len(errors) == 0, f"Concurrent analyze errors: {errors}"
    assert len(reports) == len(texts)
    for rep in reports:
        assert rep.extracted_items_count == 1
        assert rep.compliance_run_id is not None


def test_tender_router_file_upload_and_limit() -> None:
    """Test TenderRouter endpoint with file upload and 200MB limit enforcement."""
    client = TestClient(app)

    # 1. Text file upload
    file_bytes = b"Item 1: 1000m XLPE Power Cables per IS 7098 Part 2 with ISI Mark.\n"
    res = client.post(
        "/api/v1/analyze-tender",
        files={"file": ("tender_cable.txt", io.BytesIO(file_bytes), "text/plain")},
    )
    assert res.status_code == 200, f"Upload failed: {res.text}"
    data = res.json()
    assert data["document_name"] == "tender_cable.txt"
    assert data["extracted_items_count"] == 1
    assert "findings" in data
    assert "compliance_run_id" in data

    # 2. Oversized file (>200MB) simulation
    oversized_bytes = b"x" * (200 * 1024 * 1024 + 10)
    res_large = client.post(
        "/api/v1/analyze-tender",
        files={"file": ("huge_tender.txt", io.BytesIO(oversized_bytes), "text/plain")},
    )
    assert res_large.status_code == 413
    assert "200MB limit" in res_large.json()["detail"]
