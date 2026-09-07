import React from "react";
import { type Tokens } from "marked";
import { MarkdownInline } from "./MarkdownInline";
import { CodeBlock } from "./CodeBlock";
import { TableBlock } from "./TableBlock";

interface BlockProps {
  token: Tokens.Generic;
  onStandardClick?: (isCode: string) => void;
  onFileClick?: (filename: string) => void;
}

export const MarkdownBlock: React.FC<BlockProps> = ({ token, onStandardClick, onFileClick }) => {
  const inline = (toks?: Tokens.Generic[]) => (
    <MarkdownInline tokens={toks} onStandardClick={onStandardClick} onFileClick={onFileClick} />
  );

  switch (token.type) {
    case "heading": {
      const hClasses: Record<number, string> = {
        1: "text-base md:text-lg font-bold text-white tracking-tight mt-5 mb-2 pb-1.5 border-b border-white/10",
        2: "text-sm md:text-base font-semibold text-white tracking-tight mt-4 mb-2 text-apple-indigo/90",
        3: "text-xs md:text-sm font-semibold uppercase tracking-wider text-apple-blue/90 mt-3.5 mb-1.5",
        4: "text-xs font-semibold uppercase tracking-wider text-white/70 mt-3 mb-1",
      };
      const cls = hClasses[token.depth] || "text-xs font-medium text-white/60 uppercase tracking-wider mt-2 mb-1";
      return <div className={cls}>{inline(token.tokens)}</div>;
    }
    case "paragraph":
      return <p className="my-2 text-sm leading-relaxed text-white/90">{inline(token.tokens)}</p>;
    case "list": {
      const items = (token.items || []) as Tokens.ListItem[];
      return token.ordered ? (
        <ol className="my-2.5 space-y-2 pl-1 list-none">
          {items.map((it, idx) => (
            <li key={idx} className="text-sm leading-relaxed text-white/85 flex items-start gap-2.5">
              <span className="text-apple-blue font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-apple-blue/10 border border-apple-blue/20 shrink-0 mt-0.5">
                {(token.start ? Number(token.start) + idx : idx + 1)}.
              </span>
              <span className="flex-1 min-w-0">
                {it.tokens ? it.tokens.map((sub, sIdx) => <MarkdownBlock key={sIdx} token={sub} onStandardClick={onStandardClick} onFileClick={onFileClick} />) : inline(it.tokens)}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="my-2.5 space-y-1.5 pl-1 list-none">
          {items.map((it, idx) => (
            <li key={idx} className="text-sm leading-relaxed text-white/85 flex items-start gap-2">
              <span className="text-apple-indigo text-sm leading-none mt-1 shrink-0">•</span>
              <span className="flex-1 min-w-0">
                {it.tokens ? it.tokens.map((sub, sIdx) => <MarkdownBlock key={sIdx} token={sub} onStandardClick={onStandardClick} onFileClick={onFileClick} />) : inline(it.tokens)}
              </span>
            </li>
          ))}
        </ul>
      );
    }
    case "blockquote":
      return (
        <blockquote className="my-3 border-l-2 border-apple-indigo pl-3.5 py-2 text-xs md:text-sm text-white/80 bg-white/5 rounded-r-xl italic">
          {token.tokens?.map((sub: Tokens.Generic, i: number) => (
            <MarkdownBlock key={i} token={sub} onStandardClick={onStandardClick} onFileClick={onFileClick} />
          ))}
        </blockquote>
      );
    case "code":
      return <CodeBlock language={token.lang} code={token.text} />;
    case "table":
      return <TableBlock token={token as Tokens.Table} renderInline={inline} />;
    case "hr":
      return <hr className="my-4 border-t border-white/10" />;
    case "space":
      return null;
    default:
      return token.tokens ? <div>{inline(token.tokens)}</div> : <span>{token.text}</span>;
  }
};
