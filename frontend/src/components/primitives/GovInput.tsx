import React from "react";
import { clsx } from "clsx";

export interface GovInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const GovInput: React.FC<GovInputProps> = ({
  label,
  error,
  leftIcon,
  rightAction,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-gov-text-secondary dark:text-gray-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && <span className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center">{leftIcon}</span>}
        <input
          id={inputId}
          className={clsx(
            "w-full bg-white dark:bg-[#0c1626] border rounded text-sm text-gov-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue focus:border-gov-blue",
            leftIcon ? "pl-9 pr-3 py-2" : "px-3 py-2",
            error ? "border-gov-red focus:ring-gov-red" : "border-gov-border dark:border-slate-700",
            className
          )}
          {...props}
        />
        {rightAction && <div className="absolute right-2 flex items-center">{rightAction}</div>}
      </div>
      {error && <p className="text-xs text-gov-red dark:text-rose-400 font-medium mt-1">{error}</p>}
    </div>
  );
};

export default GovInput;
