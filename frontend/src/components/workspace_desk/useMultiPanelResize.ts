import { useState, useCallback, RefObject } from "react";
import {
  clampDocPct,
  clampAiPct,
  rebalancePanels,
} from "@/components/workspace_desk/workspace_desk_resize.utils";

export function useMultiPanelResize(containerRef: RefObject<HTMLDivElement | null>, aiOpen: boolean) {
  const [closedDocPct, setClosedDocPct] = useState<number>(45);
  const [openDocPct, setOpenDocPct] = useState<number>(33);
  const [openFindingsPct, setOpenFindingsPct] = useState<number>(37);

  const docPct = aiOpen ? openDocPct : closedDocPct;
  const findingsPct = aiOpen ? openFindingsPct : 100 - closedDocPct;
  const aiPct = aiOpen ? Math.max(15, 100 - openDocPct - openFindingsPct) : 0;

  const handleDocDividerDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const onMouseMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = ev.clientX - rect.left;
      const newPct = Math.round((relativeX / rect.width) * 100);

      if (aiOpen) {
        const clamped = clampDocPct(newPct, true, aiPct);
        setOpenDocPct(clamped);
        setOpenFindingsPct(100 - aiPct - clamped);
      } else {
        setClosedDocPct(clampDocPct(newPct, false, 0));
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [aiOpen, aiPct, containerRef]);

  const handleAiDividerDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const onMouseMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = ev.clientX - rect.left;
      const fromRight = rect.width - relativeX;
      const newAiPct = Math.round((fromRight / rect.width) * 100);
      const clampedAi = clampAiPct(newAiPct);

      const { docPct: newDoc, findingsPct: newFindings } = rebalancePanels(
        openDocPct,
        openFindingsPct,
        clampedAi
      );
      setOpenDocPct(newDoc);
      setOpenFindingsPct(newFindings);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [openDocPct, openFindingsPct, containerRef]);

  const resetLayout = useCallback(() => {
    if (aiOpen) {
      setOpenDocPct(33);
      setOpenFindingsPct(37);
    } else {
      setClosedDocPct(50);
    }
  }, [aiOpen]);

  return {
    docPct,
    findingsPct,
    aiPct,
    handleDocDividerDrag,
    handleAiDividerDrag,
    resetLayout,
  };
}
