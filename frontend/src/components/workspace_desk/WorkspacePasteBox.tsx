import React from "react";
import { countWords } from "@/components/workspace_desk/workspace.utils";

interface WorkspacePasteBoxProps {
  text: string;
  onChange: (val: string) => void;
  onUseSampleText: () => void;
}

export const WorkspacePasteBox: React.FC<WorkspacePasteBoxProps> = ({
  text,
  onChange,
  onUseSampleText,
}) => {
  const words = countWords(text);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gov-text-secondary dark:text-gray-400 font-medium">Paste tender specification clauses directly:</span>
        <button
          type="button"
          onClick={onUseSampleText}
          className="text-[11px] text-gov-blue dark:text-blue-400 hover:underline font-semibold"
        >
          Load sample tender clause
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste specification requirements, tender criteria, or contract clauses here..."
        className="w-full h-44 bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded-lg p-3 text-xs text-gov-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gov-blue focus:border-gov-blue resize-none font-mono leading-relaxed"
        aria-label="Paste tender text"
      />

      <div className="mt-2 flex items-center justify-between text-[11px] text-gov-text-secondary dark:text-gray-400">
        <span>{words} words &middot; {text.length} characters</span>
        {text && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-gov-text-secondary dark:text-gray-400 hover:text-gov-red transition-colors"
          >
            Clear text
          </button>
        )}
      </div>
    </div>
  );
};
