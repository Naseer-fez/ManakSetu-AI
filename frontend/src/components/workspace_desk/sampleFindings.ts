import type { ComplianceFindingItem } from "@/components/workspace_desk/types";

/**
 * Sample findings for presentational UI review desk demo only.
 * Non-authoritative layout placeholders. Live compliance requires connecting the audit engine.
 */
export const SAMPLE_WORKSPACE_FINDINGS: ComplianceFindingItem[] = [
  {
    id: "finding-1",
    clauseLocation: "Section 3.2, Cl. 3.2.4 (Technical Specs)",
    status: "critical",
    resolution: "pending",
    category: "QCO Statutory Order",
    standardReference: "Sample Citation Ref. QCO-SEC-3",
    explanation:
      "Tender clause stipulates legacy component specs without citing mandatory certification under notified Quality Control Order.",
    suggestedCorrection:
      "Update clause to mandate valid statutory certification license and conforming marking as per Department Order.",
  },
  {
    id: "finding-2",
    clauseLocation: "Section 4.1, Cl. 4.1.8 (Normative Reference)",
    status: "warning",
    resolution: "pending",
    category: "Standard Reaffirmation",
    standardReference: "Sample Standard Citation Format",
    explanation:
      "Clause references a withdrawn year edition of the testing standard without accounting for subsequent amendments.",
    suggestedCorrection:
      "Cite the reaffirmed standard edition with all prevailing amendments applicable on the tender notice date.",
  },
  {
    id: "finding-3",
    clauseLocation: "Section 5.3, Cl. 5.3.1 (Quality Assurance)",
    status: "passed",
    resolution: "pending",
    category: "Inspection Protocols",
    standardReference: "Sample QA Guidelines",
    explanation:
      "Factory inspection and third-party laboratory verification criteria conform to recommended procurement guidelines.",
    suggestedCorrection:
      "No modification required. Clause structure aligns with standard quality assurance norms.",
  },
  {
    id: "finding-4",
    clauseLocation: "Section 7.0, Cl. 7.1.2 (Packaging & Marking)",
    status: "needs_verification",
    resolution: "pending",
    category: "Marking Requirements",
    standardReference: "Sample Marking Clause",
    explanation:
      "Packaging specifications mention batch traceability but do not specify whether standard conformity mark must appear on primary package.",
    suggestedCorrection:
      "Verify with issuing authority if outer carton and primary container both require indelible conformity markings.",
  },
];
