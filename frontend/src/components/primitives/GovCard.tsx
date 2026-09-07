import React from "react";
import { clsx } from "clsx";

export interface GovCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerBorder?: boolean;
}

export const GovCard: React.FC<GovCardProps> = ({
  title,
  subtitle,
  action,
  headerBorder = true,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div
          className={clsx(
            "px-4 py-3 flex items-center justify-between bg-white dark:bg-[#111927]",
            headerBorder && "border-b border-gov-border dark:border-slate-800"
          )}
        >
          <div>
            {typeof title === "string" ? (
              <h3 className="font-semibold text-sm text-gov-navy dark:text-white tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-gov-text-secondary dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default GovCard;
