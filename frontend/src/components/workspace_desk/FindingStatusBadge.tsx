import React from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import type { FindingStatus } from "@/components/workspace_desk/types";
import { getStatusLabel } from "@/components/workspace_desk/workspace.utils";

interface FindingStatusBadgeProps {
  status: FindingStatus;
  size?: "sm" | "md";
}

export const FindingStatusBadge: React.FC<FindingStatusBadgeProps> = ({ status, size = "md" }) => {
  const label = getStatusLabel(status);

  const config = {
    critical: {
      color: "bg-red-50 dark:bg-red-950/40 text-gov-red dark:text-rose-400 border-red-200 dark:border-red-900/50",
      icon: AlertOctagon,
    },
    warning: {
      color: "bg-amber-50 dark:bg-amber-950/40 text-gov-amber dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
      icon: AlertTriangle,
    },
    passed: {
      color: "bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      icon: CheckCircle2,
    },
    needs_verification: {
      color: "bg-blue-50 dark:bg-blue-950/40 text-gov-blue dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
      icon: HelpCircle,
    },
  }[status];

  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm ${sizeClasses} ${config.color}`}
      role="status"
      aria-label={`Finding status: ${label}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
