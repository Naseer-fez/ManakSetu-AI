import { type FC } from 'react';
import type { TenderAnalysisReport } from '@/types';
import { CopyAction } from '@/components/primitives/CopyAction';
import { cn } from '@/lib/utils';

interface ComplianceFindingsProps {
  report: TenderAnalysisReport;
}

export const ComplianceFindings: FC<ComplianceFindingsProps> = ({ report }) => {
  const findings = report.compliance_issues || [];
  
  const high = findings.filter(f => f.severity === 'HIGH');
  const medium = findings.filter(f => f.severity === 'MEDIUM');
  const low = findings.filter(f => f.severity === 'LOW');
  
  const groups = [
    { label: 'HIGH', items: high, bg: 'bg-status-danger-bg', text: 'text-text-danger' },
    { label: 'MEDIUM', items: medium, bg: 'bg-status-warning-bg', text: 'text-text-warning' },
    { label: 'LOW', items: low, bg: 'bg-canvas', text: 'text-text-muted' },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Compliance Findings</h3>
        <div className="text-sm">
          <span className="text-text-secondary">Mandatory QCO Coverage: </span>
          <strong className="text-text-primary">{report.mandatory_qco_coverage}%</strong>
        </div>
      </div>

      <div className="space-y-6">
        {groups.map(group => group.items.length > 0 && (
          <div key={group.label}>
            <h4 className={cn("text-xs font-semibold px-2 py-1 rounded inline-block mb-3", group.bg, group.text)}>
              {group.label} SEVERITY
            </h4>
            <div className="space-y-3">
              {group.items.map((issue, i) => (
                <div key={i} className="bg-panel border border-border-subtle p-3 rounded-lg text-sm">
                  <p className="text-text-primary font-medium mb-1">{issue.issue_text}</p>
                  <p className="text-text-secondary italic mb-3">Action: {issue.corrective_action}</p>
                  
                  {i === 0 && report.complete_spec_clause_text && (
                    <div className="mt-2 bg-canvas p-2 rounded relative group border border-border-subtle">
                      <div className="text-xs text-text-muted mb-1">Spec Clause:</div>
                      <p className="text-text-primary pr-8">{report.complete_spec_clause_text}</p>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyAction content={report.complete_spec_clause_text} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {findings.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">No compliance issues found</div>
        )}
      </div>
    </div>
  );
};

