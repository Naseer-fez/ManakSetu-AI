import { useState, useRef, useEffect, useCallback } from "react";
import type { PositionedNode } from "@/components/graph/types";
import { computeFocusCamera } from "@/components/graph/graph-physics.utils";

export function useGraphCamera(
  onClearNode?: () => void
) {
  const [zoom, setZoom] = useState(1.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const resetCamera = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1.5);
    onClearNode?.();
  }, [onClearNode]);

  const focusOnNode = useCallback((node: PositionedNode, neighbors: PositionedNode[]) => {
    const camera = computeFocusCamera(node, neighbors);
    setPan(camera.pan);
    setZoom(camera.zoom);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = Math.abs(e.clientX - (dragStartRef.current.x + pan.x));
    const deltaY = Math.abs(e.clientY - (dragStartRef.current.y + pan.y));
    if (deltaX > 3 || deltaY > 3) hasMovedRef.current = true;
    setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") resetCamera();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetCamera]);

  return {
    zoom,
    setZoom,
    pan,
    isDragging,
    hasMoved: hasMovedRef,
    resetCamera,
    focusOnNode,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
