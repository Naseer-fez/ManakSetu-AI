import { RefObject } from "react";

/**
 * Custom drag hook for horizontal resizing between Audit Workspace and AI Copilot.
 */
export function useLayoutDrag(
  containerRef: RefObject<HTMLDivElement | null>,
  onPercentChange: (pct: number) => void
) {
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMouseMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = ev.clientX - rect.left;
      const newAuditPercent = (relativeX / rect.width) * 100;
      const newAi = Math.min(80, Math.max(35, Math.round(100 - newAuditPercent)));
      onPercentChange(newAi);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return handleDragStart;
}
