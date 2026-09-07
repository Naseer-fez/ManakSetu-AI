import { type FC } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, FileEdit, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ComplianceStatus =
  | 'COMPLIANT'
  | 'NEEDS_VERIFICATION'
  | 'NON_COMPLIANT'
  | 'REVIEW_REQUIRED'
  | 'DRAFT'
  | 'APPROVED'
  | 'Compliant'
  | 'Needs verification'
  | 'Non-compliant'
  | 'Review required'
  | 'Draft'
  | 'Approved';

export interface StatusTokenProps {
  status: ComplianceStatus | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

interface Config {
  label: string;
  style: string;
  icon: typeof CheckCircle2;
}

const statusConfigs: Record<string, Config> = {
  COMPLIANT: { label: 'Compliant', style: 'text-status-compliant bg-status-compliant-bg border-status-compliant/30', icon: CheckCircle2 },
  APPROVED: { label: 'Approved', style: 'text-status-compliant bg-status-compliant-bg border-status-compliant/30', icon: CheckCircle2 },
  NEEDS_VERIFICATION: { label: 'Needs verification', style: 'text-status-warning bg-status-warning-bg border-status-warning/30', icon: AlertTriangle },
  REVIEW_REQUIRED: { label: 'Review required', style: 'text-status-warning bg-status-warning-bg border-status-warning/30', icon: AlertTriangle },
  NON_COMPLIANT: { label: 'Non-compliant', style: 'text-status-danger bg-status-danger-bg border-status-danger/30', icon: XCircle },
  EXPORT_BLOCKED: { label: 'Export blocked', style: 'text-status-danger bg-status-danger-bg border-status-danger/30', icon: XCircle },
  DRAFT: { label: 'Draft', style: 'text-status-draft bg-status-draft-bg border-status-draft/30', icon: FileEdit },
};

export const StatusToken: FC<StatusTokenProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const normalizedKey = (status || '').toUpperCase().replace(/\s+/g, '_');
  const config = statusConfigs[normalizedKey] || {
    label: statusConfigs[status] ? statusConfigs[status].label : 'Review required',
    style: 'text-status-warning bg-status-warning-bg border-status-warning/30',
    icon: HelpCircle,
  };

  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-md whitespace-nowrap select-none',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.style,
        className
      )}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{config.label}</span>
    </span>
  );
};
