import React from "react";
import { type Tokens } from "marked";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";

interface InlineProps {
  tokens?: Tokens.Generic[];
  onStandardClick?: (isCode: string) => void;
  onFileClick?: (filename: string) => void;
}

const renderTextWithBadges = (
  text: string,
  onStandardClick?: (isCode: string) => void,
  onFileClick?: (filename: string) => void
): React.ReactNode[] => {
  const tokenRegex = /(\b[A-Za-z0-9_\-]+\.md\b|\bIS\s\d+(?:[-:][A-Za-z0-9]+)?\b)/g;
  const parts: React.ReactNode[] = [];
  let idx = 0;
  let m: RegExpExecArray | null;

  while ((m = tokenRegex.exec(text)) !== null) {
    if (m.index > idx) parts.push(text.slice(idx, m.index));
    const raw = m[0];
    if (raw.endsWith(".md")) {
      parts.push(
        <button
          key={`doc-${m.index}`}
          type="button"
          onClick={() => onFileClick?.(raw)}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gov-navy dark:text-gray-200 font-mono text-[11px] hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer align-baseline"
          title={`View Document: ${raw}`}
        >
          <FileText className="w-3 h-3 shrink-0 text-gov-blue" />
          <span>{raw}</span>
        </button>
      );
    } else {
      parts.push(
        <button
          key={`std-${m.index}`}
          type="button"
          onClick={() => onStandardClick?.(raw)}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-gov-blue dark:text-blue-400 font-mono font-bold text-[11px] hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer align-baseline shadow-2xs"
          title={`View Standard: ${raw}`}
        >
          <ShieldCheck className="w-3 h-3 text-gov-green shrink-0" />
          <span>{raw}</span>
        </button>
      );
    }
    idx = tokenRegex.lastIndex;
  }
  if (idx < text.length) parts.push(text.slice(idx));
  return parts;
};

export const MarkdownInline: React.FC<InlineProps> = ({ tokens, onStandardClick, onFileClick }) => {
  if (!tokens || tokens.length === 0) return null;

  return (
    <>
      {tokens.map((t, i) => {
        if (t.type === "strong") {
          return <strong key={i} className="font-semibold text-gov-navy dark:text-white"><MarkdownInline tokens={t.tokens} onStandardClick={onStandardClick} onFileClick={onFileClick} /></strong>;
        }
        if (t.type === "em") {
          return <em key={i} className="italic text-gov-text dark:text-gray-300"><MarkdownInline tokens={t.tokens} onStandardClick={onStandardClick} onFileClick={onFileClick} /></em>;
        }
        if (t.type === "codespan") {
          return <code key={i} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 font-mono text-[11px] text-gov-blue dark:text-blue-400 border border-gray-300 dark:border-slate-700">{t.text}</code>;
        }
        if (t.type === "del") {
          return <del key={i} className="line-through text-gray-400 dark:text-gray-500"><MarkdownInline tokens={t.tokens} onStandardClick={onStandardClick} onFileClick={onFileClick} /></del>;
        }
        if (t.type === "link") {
          return (
            <a key={i} href={t.href} target="_blank" rel="noopener noreferrer" className="text-gov-blue hover:text-gov-navy dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 inline-flex items-center gap-0.5 font-medium transition-colors">
              <MarkdownInline tokens={t.tokens} onStandardClick={onStandardClick} onFileClick={onFileClick} />
              <ExternalLink className="w-2.5 h-2.5 opacity-70 inline" />
            </a>
          );
        }
        if (t.type === "br") return <br key={i} />;
        if (t.tokens && t.tokens.length > 0) {
          return <MarkdownInline key={i} tokens={t.tokens} onStandardClick={onStandardClick} onFileClick={onFileClick} />;
        }
        return <React.Fragment key={i}>{renderTextWithBadges(t.text || "", onStandardClick, onFileClick)}</React.Fragment>;
      })}
    </>
  );
};
