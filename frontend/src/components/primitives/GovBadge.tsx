import React from "react";
import { clsx } from "clsx";

export type GovBadgeStatus = "compliant" | "warning" | "critical" | "draft" | "needs_verification" | "info";

export interface GovBadgeProps {
  status: GovBadgeStatus;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const statusStyles: Record<GovBadgeStatus, { bg: string; text: string; border: string }> = {
  compliant: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-gov-green dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-gov-amber dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  critical: {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-gov-red dark:text-red-400",
    border: "border-red-200 dark:border-red-900",
  },
  draft: {
    bg: "bg-gray-100 dark:bg-slate-800",
    text: "text-gray-600 dark:text-gray-300",
    border: "border-gray-300 dark:border-slate-700",
  },
  needs_verification: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-gov-blue dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-900",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-gov-navy dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
};

export const GovBadge: React.FC<GovBadgeProps> = ({ status, label, icon, className, children }) => {
  const current = statusStyles[status] || statusStyles.info;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {label || children}
    </span>
  );
};

export default GovBadge;
