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
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-apple-indigo/20 border border-apple-indigo/30 text-apple-indigo font-mono text-[11px] hover:bg-apple-indigo/30 transition-colors cursor-pointer align-baseline"
          title={`View Document: ${raw}`}
        >
          <FileText className="w-3 h-3 shrink-0" />
          <span>{raw}</span>
        </button>
      );
    } else {
      parts.push(
        <button
          key={`std-${m.index}`}
          type="button"
          onClick={() => onStandardClick?.(raw)}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-apple-blue/20 border border-apple-blue/30 text-white font-medium text-[11px] hover:bg-apple-blue/30 transition-colors cursor-pointer align-baseline"
          title={`View Standard: ${raw}`}
        >
          <ShieldCheck className="w-3 h-3 text-apple-mint shrink-0" />
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
          return <strong key={i} className="font-semibold text-white"><MarkdownInline tokens={t.tokens} onStandardClick={onStandardClick} onFileClick={onFileClick} /></strong>;
        }
        if (t.type === "em") {
          return <em key={i} className="italic text-white/80"><MarkdownInline tokens={t.tokens} onStandardClick={onStandardClick} onFileClick={onFileClick} /></em>;
        }
        if (t.type === "codespan") {
          return <code key={i} className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[11px] text-apple-mint border border-white/5">{t.text}</code>;
        }
        if (t.type === "del") {
          return <del key={i} className="line-through text-white/50"><MarkdownInline tokens={t.tokens} onStandardClick={onStandardClick} onFileClick={onFileClick} /></del>;
        }
        if (t.type === "link") {
          return (
            <a key={i} href={t.href} target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:text-apple-indigo underline underline-offset-2 inline-flex items-center gap-0.5 font-medium transition-colors">
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
