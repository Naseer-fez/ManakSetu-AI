import { useState, useRef, useEffect, useCallback } from "react";
import type { PositionedNode } from "@/components/graph/types";
import { computeFocusCamera } from "@/components/graph/graph-physics.utils";

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 4.0;
const ZOOM_SENSITIVITY = 0.0012;

export function useGraphCamera(onClearNode?: () => void) {
  const [zoom, setZoom] = useState(1.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Refs for smooth animated zoom via RAF
  const targetZoomRef = useRef(1.5);
  const currentZoomRef = useRef(1.5);
  const rafRef = useRef<number | null>(null);

  const animateZoom = useCallback(() => {
    const diff = targetZoomRef.current - currentZoomRef.current;
    if (Math.abs(diff) < 0.001) {
      currentZoomRef.current = targetZoomRef.current;
      setZoom(currentZoomRef.current);
      rafRef.current = null;
      return;
    }
    currentZoomRef.current += diff * 0.18;
    setZoom(Number(currentZoomRef.current.toFixed(4)));
    rafRef.current = requestAnimationFrame(animateZoom);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, targetZoomRef.current + delta * targetZoomRef.current));
      targetZoomRef.current = Number(next.toFixed(4));
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animateZoom);
      }
    },
    [animateZoom]
  );

  const resetCamera = useCallback(() => {
    targetZoomRef.current = 1.5;
    currentZoomRef.current = 1.5;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPan({ x: 0, y: 0 });
    setZoom(1.5);
    onClearNode?.();
  }, [onClearNode]);

  const focusOnNode = useCallback((node: PositionedNode, neighbors: PositionedNode[]) => {
    const camera = computeFocusCamera(node, neighbors);
    targetZoomRef.current = camera.zoom;
    currentZoomRef.current = camera.zoom;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
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

  // Cleanup RAF on unmount
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return {
    zoom,
    setZoom: (updater: ((z: number) => number) | number) => {
      const next = typeof updater === "function" ? updater(targetZoomRef.current) : updater;
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
      targetZoomRef.current = clamped;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animateZoom);
      }
    },
    pan,
    isDragging,
    hasMoved: hasMovedRef,
    resetCamera,
    focusOnNode,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  };
}
