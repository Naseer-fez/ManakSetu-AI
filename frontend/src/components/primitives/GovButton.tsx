import React from "react";
import { clsx } from "clsx";

export interface GovButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const GovButton: React.FC<GovButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-gov-blue hover:bg-blue-700 text-white focus:ring-gov-blue",
    secondary: "bg-white hover:bg-gov-offwhite dark:bg-slate-800 dark:hover:bg-slate-700 text-gov-text dark:text-gray-200 border border-gov-border dark:border-slate-700 focus:ring-gov-navy dark:focus:ring-slate-500",
    danger: "bg-gov-red hover:bg-red-700 text-white focus:ring-gov-red",
    outline: "bg-transparent hover:bg-gov-blue-light dark:hover:bg-blue-950/40 text-gov-blue dark:text-blue-400 border border-gov-blue dark:border-blue-500 focus:ring-gov-blue",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  return (
    <button
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default GovButton;
