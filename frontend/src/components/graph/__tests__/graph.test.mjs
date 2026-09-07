import test from "node:test";
import assert from "node:assert";

function pseudoHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function computeClusteredLayout(rawNodes, edges) {
  if (!rawNodes.length) return [];
  const divisions = Array.from(new Set(rawNodes.map(n => n.division || "General")));
  const divAngleStep = (2 * Math.PI) / (divisions.length || 1);
  const clusterDist = Math.max(200, Math.min(270, divisions.length * 48));

  const clusterAnchors = {};
  divisions.forEach((div, idx) => {
    const angle = idx * divAngleStep - Math.PI / 2;
    clusterAnchors[div] = {
      x: Math.cos(angle) * clusterDist,
      y: Math.sin(angle) * clusterDist,
    };
  });

  const nodes = rawNodes.map((n) => {
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
    };
  });

  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, n));
  const iterations = 150;
  const targetEdgeDist = 78;
  const minNodeDist = 68;

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = Math.max(0.06, 1 - iter / iterations);
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
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const anchor = clusterAnchors[a.clusterId] || { x: 0, y: 0 };
      a.x += (anchor.x - a.x) * 0.05 * alpha;
      a.y += (anchor.y - a.y) * 0.05 * alpha;
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

test("computeClusteredLayout creates compact layout with zero node overlaps", () => {
  const sampleNodes = [
    { id: "IS 456", label: "IS 456", division: "CED" },
    { id: "IS 1786", label: "IS 1786", division: "CED" },
    { id: "IS 516", label: "IS 516", division: "CED" },
    { id: "IS 694", label: "IS 694", division: "ETD" },
    { id: "IS 1554", label: "IS 1554", division: "ETD" },
    { id: "IS 2062", label: "IS 2062", division: "MED" },
  ];
  const sampleEdges = [
    { source: "IS 456", target: "IS 1786" },
    { source: "IS 456", target: "IS 516" },
    { source: "IS 694", target: "IS 1554" },
  ];

  const positioned = computeClusteredLayout(sampleNodes, sampleEdges);
  assert.strictEqual(positioned.length, 6);

  let minDist = Infinity;
  for (let i = 0; i < positioned.length; i++) {
    for (let j = i + 1; j < positioned.length; j++) {
      const d = Math.hypot(positioned[i].x - positioned[j].x, positioned[i].y - positioned[j].y);
      if (d < minDist) minDist = d;
    }
  }

  assert.ok(minDist >= 50, `Expected minDist >= 50, got ${minDist}`);
  const xs = positioned.map(n => n.x);
  const ys = positioned.map(n => n.y);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);

  assert.ok(spanX < 800, `Expected compact spanX < 800, got ${spanX}`);
  assert.ok(spanY < 800, `Expected compact spanY < 800, got ${spanY}`);
});
