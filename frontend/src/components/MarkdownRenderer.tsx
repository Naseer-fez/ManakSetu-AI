import React, { useMemo } from "react";
import { marked, type TokensList } from "marked";
import { clsx } from "clsx";
import { MarkdownBlock } from "./markdown/MarkdownBlock";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onStandardClick?: (isCode: string) => void;
  onFileClick?: (filename: string) => void;
}

marked.use({
  gfm: true,
  breaks: true,
});

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  onStandardClick,
  onFileClick,
}) => {
  const tokens = useMemo<TokensList | null>(() => {
    if (!content) return null;
    try {
      return marked.lexer(content);
    } catch {
      return null;
    }
  }, [content]);

  if (!content) return null;

  if (!tokens) {
    return <div className={clsx("text-white/80 text-sm whitespace-pre-wrap", className)}>{content}</div>;
  }

  return (
    <div className={clsx("markdown-body text-slate-100 space-y-1 text-sm leading-relaxed", className)}>
      {tokens.map((token, index) => (
        <MarkdownBlock
          key={index}
          token={token}
          onStandardClick={onStandardClick}
          onFileClick={onFileClick}
        />
      ))}
    </div>
  );
};
