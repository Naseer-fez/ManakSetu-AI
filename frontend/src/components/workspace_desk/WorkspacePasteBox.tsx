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
        <span className="text-xs text-white/60">Paste tender specification clauses directly:</span>
        <button
          type="button"
          onClick={onUseSampleText}
          className="text-[11px] text-apple-blue hover:underline"
        >
          Load sample tender clause
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste specification requirements, tender criteria, or contract clauses here..."
        className="w-full h-44 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-apple-blue resize-none font-mono leading-relaxed"
        aria-label="Paste tender text"
      />

      <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
        <span>{words} words &middot; {text.length} characters</span>
        {text && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-white/50 hover:text-white transition-colors"
          >
            Clear text
          </button>
        )}
      </div>
    </div>
  );
};
