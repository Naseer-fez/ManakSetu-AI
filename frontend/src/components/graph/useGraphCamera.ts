import { useState, useRef, useEffect, useCallback } from "react";
import type { PositionedNode } from "@/components/graph/types";
import { computeFocusCamera } from "@/components/graph/graph-physics.utils";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4.5;
const BASE_VIEW_WIDTH = 1300;
const BASE_VIEW_HEIGHT = 960;

export function useGraphCamera(onClearNode?: () => void) {
  const [zoom, setZoom] = useState(1.2);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Target values for animated transition
  const targetZoomRef = useRef(1.2);
  const currentZoomRef = useRef(1.2);
  const targetPanRef = useRef({ x: 0, y: 0 });
  const currentPanRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const animateCamera = useCallback(() => {
    const diffZ = targetZoomRef.current - currentZoomRef.current;
    const diffX = targetPanRef.current.x - currentPanRef.current.x;
    const diffY = targetPanRef.current.y - currentPanRef.current.y;

    if (Math.abs(diffZ) < 0.001 && Math.abs(diffX) < 0.5 && Math.abs(diffY) < 0.5) {
      currentZoomRef.current = targetZoomRef.current;
      currentPanRef.current = { ...targetPanRef.current };
      setZoom(currentZoomRef.current);
      setPan(currentPanRef.current);
      rafRef.current = null;
      return;
    }

    currentZoomRef.current += diffZ * 0.28;
    currentPanRef.current.x += diffX * 0.28;
    currentPanRef.current.y += diffY * 0.28;

    setZoom(Number(currentZoomRef.current.toFixed(4)));
    setPan({
      x: Math.round(currentPanRef.current.x),
      y: Math.round(currentPanRef.current.y),
    });

    rafRef.current = requestAnimationFrame(animateCamera);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Convert mouse position to SVG viewbox coords (-650 to 650, -480 to 480)
      const svgX = (clientX / rect.width) * BASE_VIEW_WIDTH - BASE_VIEW_WIDTH / 2;
      const svgY = (clientY / rect.height) * BASE_VIEW_HEIGHT - BASE_VIEW_HEIGHT / 2;

      // Multiplicative zoom factor for smooth relative scaling
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const oldZoom = targetZoomRef.current;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom * zoomFactor));

      if (Math.abs(newZoom - oldZoom) < 0.001) return;

      // Focal point math: keep the world point under the cursor stationary
      const worldX = (svgX - targetPanRef.current.x) / oldZoom;
      const worldY = (svgY - targetPanRef.current.y) / oldZoom;

      const newPanX = svgX - worldX * newZoom;
      const newPanY = svgY - worldY * newZoom;

      targetZoomRef.current = Number(newZoom.toFixed(4));
      targetPanRef.current = { x: newPanX, y: newPanY };

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animateCamera);
      }
    },
    [animateCamera]
  );

  const resetCamera = useCallback(() => {
    targetZoomRef.current = 1.2;
    currentZoomRef.current = 1.2;
    targetPanRef.current = { x: 0, y: 0 };
    currentPanRef.current = { x: 0, y: 0 };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPan({ x: 0, y: 0 });
    setZoom(1.2);
    onClearNode?.();
  }, [onClearNode]);

  const focusOnNode = useCallback((node: PositionedNode, neighbors: PositionedNode[]) => {
    const camera = computeFocusCamera(node, neighbors);
    targetZoomRef.current = camera.zoom;
    currentZoomRef.current = camera.zoom;
    targetPanRef.current = camera.pan;
    currentPanRef.current = camera.pan;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPan(camera.pan);
    setZoom(camera.zoom);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX - targetPanRef.current.x, y: e.clientY - targetPanRef.current.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = Math.abs(e.clientX - (dragStartRef.current.x + targetPanRef.current.x));
    const deltaY = Math.abs(e.clientY - (dragStartRef.current.y + targetPanRef.current.y));
    if (deltaX > 3 || deltaY > 3) hasMovedRef.current = true;
    const nextPan = { x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y };
    targetPanRef.current = nextPan;
    currentPanRef.current = nextPan;
    setPan(nextPan);
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") resetCamera();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetCamera]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return {
    zoom,
    setZoom: (updater: ((z: number) => number) | number) => {
      const next = typeof updater === "function" ? updater(targetZoomRef.current) : updater;
      targetZoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
      if (!rafRef.current) rafRef.current = requestAnimationFrame(animateCamera);
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
