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
    <div className={clsx("my-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 shadow-inner", className)}>
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {token.header.map((cell, idx) => (
              <th
                key={idx}
                className={clsx(
                  "px-4 py-2.5 font-semibold text-white tracking-wider uppercase text-[11px]",
                  cell.align === "center" && "text-center",
                  cell.align === "right" && "text-right"
                )}
              >
                {cell.tokens?.length ? renderInline(cell.tokens as Tokens.Generic[]) : cell.text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {token.rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-white/[0.03] transition-colors odd:bg-transparent even:bg-white/[0.015]"
            >
              {row.map((cell, colIdx) => (
                <td
                  key={colIdx}
                  className={clsx(
                    "px-4 py-2 text-white/80 leading-relaxed",
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
