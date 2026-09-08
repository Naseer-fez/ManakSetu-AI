/**
 * Utility functions for clamping and rebalancing multi-panel workspace widths.
 */

export function clampDocPct(newPct: number, aiOpen: boolean, aiPct: number): number {
  if (aiOpen) {
    const maxDoc = 100 - aiPct - 20;
    return Math.min(maxDoc, Math.max(18, newPct));
  }
  return Math.min(80, Math.max(20, newPct));
}

export function clampAiPct(newAiPct: number): number {
  return Math.min(50, Math.max(18, newAiPct));
}

export function rebalancePanels(
  currentDoc: number,
  currentFindings: number,
  newAiPct: number
): { docPct: number; findingsPct: number } {
  const remaining = 100 - newAiPct;
  const currentSum = currentDoc + currentFindings;
  const factor = currentSum > 0 ? remaining / currentSum : 0.5;
  const docPct = Math.max(18, Math.round(currentDoc * factor));
  const findingsPct = remaining - docPct;
  return { docPct, findingsPct };
}
