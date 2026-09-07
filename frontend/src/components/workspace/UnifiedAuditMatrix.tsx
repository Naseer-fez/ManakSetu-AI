import React from "react";
import { UnifiedAuditMetrics } from "@/components/workspace/UnifiedAuditMetrics";
import { UnifiedItemsList } from "@/components/workspace/UnifiedItemsList";
import { UnifiedFindingsList } from "@/components/workspace/UnifiedFindingsList";
import { TenderGemQcoSection } from "@/components/workspace/TenderGemQcoSection";
import type { WorkspaceAnalysis } from "@/types";

interface UnifiedAuditMatrixProps {
  analysis: WorkspaceAnalysis;
}

export const UnifiedAuditMatrix: React.FC<UnifiedAuditMatrixProps> = ({ analysis }) => {
  const { report, compliance_run } = analysis;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Full-width Metrics Strip */}
      <UnifiedAuditMetrics analysis={analysis} />

      {/* Connected Audit Grid (Internally Scrollable both Horizontally & Vertically) */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto p-4 sm:p-6 scrollbar-thin">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-[580px] max-w-7xl mx-auto">
          {/* Left / Main: GeM/QCO Radar & Extracted Specification Clauses */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            <TenderGemQcoSection items={report.items} />
            <UnifiedItemsList items={report.items} />
          </div>

          {/* Right: Statutory Compliance Findings & Harmonized Clause */}
          <div className="lg:col-span-5 xl:col-span-5">
            <UnifiedFindingsList
              findings={compliance_run.findings}
              completeSpecClause={report.complete_spec_clause_text}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
