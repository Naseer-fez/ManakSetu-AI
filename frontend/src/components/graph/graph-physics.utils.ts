import type { PositionedNode, GraphEdgeData } from "@/components/graph/types";
import type { GraphData } from "@/types";

function pseudoHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function computeClusteredLayout(
  rawNodes: GraphData["nodes"],
  edges: GraphEdgeData[]
): PositionedNode[] {
  if (!rawNodes.length) return [];

  const divisions = Array.from(new Set(rawNodes.map(n => n.division || "General")));
  const divAngleStep = (2 * Math.PI) / (divisions.length || 1);
  const clusterDist = Math.max(200, Math.min(270, divisions.length * 48));

  const clusterAnchors: Record<string, { x: number; y: number }> = {};
  divisions.forEach((div, idx) => {
    const angle = idx * divAngleStep - Math.PI / 2;
    clusterAnchors[div] = {
      x: Math.cos(angle) * clusterDist,
      y: Math.sin(angle) * clusterDist,
    };
  });

  const nodes: PositionedNode[] = rawNodes.map((n) => {
    const div = n.division || "General";
    const anchor = clusterAnchors[div] || { x: 0, y: 0 };
    const h = pseudoHash(n.id);
    const angle = (h % 360) * (Math.PI / 180);
    const radius = 25 + (h % 45);
    return {
      ...n,
      clusterId: div,
      x: anchor.x + Math.cos(angle) * radius,
      y: anchor.y + Math.sin(angle) * radius,
      isTenderStandard: false,
    };
  });

  const nodeMap = new Map<string, PositionedNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const iterations = 150;
  const targetEdgeDist = 78;
  const minNodeDist = 68;

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = Math.max(0.06, 1 - iter / iterations);

    // 1. Attractive spring force along edges
    for (const edge of edges) {
      const s = nodeMap.get(edge.source);
      const t = nodeMap.get(edge.target);
      if (!s || !t) continue;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.hypot(dx, dy) || 1;
      const force = ((dist - targetEdgeDist) / dist) * 0.12 * alpha;
      const fx = dx * force;
      const fy = dy * force;
      s.x += fx;
      s.y += fy;
      t.x -= fx;
      t.y -= fy;
    }

    // 2. Gravitational pull toward division anchor, center gravity & node repulsion
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const anchor = clusterAnchors[a.clusterId] || { x: 0, y: 0 };
      a.x += (anchor.x - a.x) * 0.05 * alpha;
      a.y += (anchor.y - a.y) * 0.05 * alpha;
      // Center gravity brings clusters closer together
      a.x += (0 - a.x) * 0.018 * alpha;
      a.y += (0 - a.y) * 0.018 * alpha;

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < minNodeDist) {
          const push = ((minNodeDist - dist) / dist) * 0.45 * alpha;
          a.x -= dx * push;
          a.y -= dy * push;
          b.x += dx * push;
          b.y += dy * push;
        }
      }
    }
  }

  // 3. Relaxation collision pass to guarantee no node overlap
  const hardRadius = 56;
  for (let p = 0; p < 8; p++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < hardRadius) {
          const overlap = (hardRadius - dist) / 2;
          const ox = (dx / dist) * overlap;
          const oy = (dy / dist) * overlap;
          a.x -= ox;
          a.y -= oy;
          b.x += ox;
          b.y += oy;
        }
      }
    }
  }

  return nodes;
}

export function getNetworkNeighborIds(
  selectedId: string | null,
  edges: GraphEdgeData[]
): { direct: Set<string>; secondary: Set<string> } {
  const direct = new Set<string>();
  const secondary = new Set<string>();
  if (!selectedId) return { direct, secondary };

  for (const e of edges) {
    if (e.source === selectedId) direct.add(e.target);
    if (e.target === selectedId) direct.add(e.source);
  }

  for (const e of edges) {
    if (direct.has(e.source) && e.target !== selectedId && !direct.has(e.target)) {
      secondary.add(e.target);
    }
    if (direct.has(e.target) && e.source !== selectedId && !direct.has(e.source)) {
      secondary.add(e.source);
    }
  }

  return { direct, secondary };
}

export function computeFocusCamera(
  selectedNode: PositionedNode,
  directNeighborNodes: PositionedNode[]
): { pan: { x: number; y: number }; zoom: number } {
  const targets = [selectedNode, ...directNeighborNodes];
  const xs = targets.map(t => t.x);
  const ys = targets.map(t => t.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = Math.max(240, maxX - minX + 140);
  const spanY = Math.max(200, maxY - minY + 140);

  const targetZoom = Math.min(1.6, Math.max(1.1, Math.min(750 / spanX, 550 / spanY)));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    pan: {
      x: Math.round(-centerX * targetZoom + 110),
      y: Math.round(-centerY * targetZoom),
    },
    zoom: Number(targetZoom.toFixed(2)),
  };
}
