import React from "react";
import { type Tokens } from "marked";
import { clsx } from "clsx";

interface TableBlockProps {
  token: Tokens.Table;
  renderInline: (tokens: Tokens.Generic[]) => React.ReactNode;
  className?: string;
}

export const TableBlock: React.FC<TableBlockProps> = ({ token, renderInline, className }) => {
  return (
    <div className={clsx("my-3 overflow-x-auto rounded border border-gov-border dark:border-slate-700 bg-white dark:bg-[#111927] shadow-sm", className)}>
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-gov-navy dark:bg-slate-800 text-white select-none">
            {token.header.map((cell, idx) => (
              <th
                key={idx}
                className={clsx(
                  "px-3 py-2 font-semibold text-white tracking-wider uppercase text-[11px]",
                  cell.align === "center" && "text-center",
                  cell.align === "right" && "text-right"
                )}
              >
                {cell.tokens?.length ? renderInline(cell.tokens as Tokens.Generic[]) : cell.text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gov-border dark:divide-slate-700">
          {token.rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors odd:bg-white dark:odd:bg-[#111927] even:bg-gov-offwhite dark:even:bg-[#0d1420]"
            >
              {row.map((cell, colIdx) => (
                <td
                  key={colIdx}
                  className={clsx(
                    "px-3 py-2 text-gov-text dark:text-gray-200 leading-relaxed",
                    cell.align === "center" && "text-center",
                    cell.align === "right" && "text-right"
                  )}
                >
                  {cell.tokens?.length ? renderInline(cell.tokens as Tokens.Generic[]) : cell.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableBlock;
