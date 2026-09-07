import type { Editor } from "@tiptap/react";
import type { ComplianceFindingItem, FindingStatus } from "@/components/workspace_desk/types";

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function filterFindings(
  findings: ComplianceFindingItem[],
  statusFilter: "all" | FindingStatus
): ComplianceFindingItem[] {
  if (statusFilter === "all") return findings;
  return findings.filter((f) => f.status === statusFilter);
}

export function generateAiPromptForFinding(finding: ComplianceFindingItem): string {
  return `Regarding ${finding.clauseLocation}: The audit notes "${finding.explanation}". How should I redraft this tender clause to resolve the issue?`;
}

export function replaceExactEditorBlock(editor: Editor | null, sourceText: string, replacementText: string): boolean {
  if (!editor || !sourceText.trim() || !replacementText.trim()) return false;
  const normalizeClause = (value: string): string => value
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[|*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const normalizedSource = normalizeClause(sourceText);
  let from: number | null = null;
  let to: number | null = null;
  editor.state.doc.descendants((node, position) => {
    if (from !== null || !node.isTextblock || normalizeClause(node.textContent) !== normalizedSource) return true;
    from = position + 1;
    to = from + node.content.size;
    return false;
  });
  if (from === null || to === null) return false;
  const replacement = editor.schema.text(replacementText);
  editor.chain().focus().command(({ tr }) => {
    tr.replaceWith(from as number, to as number, replacement);
    return true;
  }).run();
  return true;
}

export function getStatusLabel(status: FindingStatus): string {
  switch (status) {
    case "critical":
      return "Critical";
    case "warning":
      return "Warning";
    case "passed":
      return "Passed";
    case "needs_verification":
      return "Needs Verification";
  }
}
