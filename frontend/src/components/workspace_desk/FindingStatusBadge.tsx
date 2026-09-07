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
      color: "bg-apple-red/15 text-apple-red border-apple-red/30",
      icon: AlertOctagon,
    },
    warning: {
      color: "bg-apple-amber/15 text-apple-amber border-apple-amber/30",
      icon: AlertTriangle,
    },
    passed: {
      color: "bg-apple-mint/15 text-apple-mint border-apple-mint/30",
      icon: CheckCircle2,
    },
    needs_verification: {
      color: "bg-apple-indigo/15 text-indigo-300 border-apple-indigo/30",
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
