import {
  computeClusteredLayout,
  getNetworkNeighborIds,
  computeFocusCamera,
} from "@/components/graph/graph-physics.utils";
import type { PositionedNode } from "@/components/graph/types";

export function runGraphPhysicsTests(): boolean {
  const sampleNodes = [
    {
      id: "IS 456",
      label: "IS 456",
      title: "Plain and Reinforced Concrete",
      division: "Civil Engineering",
      is_mandatory: true,
      status: "Active",
    },
    {
      id: "IS 1786",
      label: "IS 1786",
      title: "High Strength Deformed Steel Bars",
      division: "Civil Engineering",
      is_mandatory: true,
      status: "Active",
    },
    {
      id: "IS 516 (Pt 1)",
      label: "IS 516 (Pt 1)",
      title: "Methods of Tests for Strength of Concrete",
      division: "Civil Engineering",
      is_mandatory: false,
      status: "Active",
    },
    {
      id: "IS 694",
      label: "IS 694",
      title: "PVC Insulated Cables",
      division: "Electrotechnical",
      is_mandatory: true,
      status: "Active",
    },
  ];

  const sampleEdges = [
    { source: "IS 456", target: "IS 1786", relation: "Normative Reference" },
    { source: "IS 456", target: "IS 516 (Pt 1)", relation: "Test Method" },
  ];

  // Test 1: computeClusteredLayout
  const positioned = computeClusteredLayout(sampleNodes, sampleEdges);
  if (positioned.length !== sampleNodes.length) {
    throw new Error(`Expected 4 positioned nodes, got ${positioned.length}`);
  }
  for (const n of positioned) {
    if (typeof n.x !== "number" || isNaN(n.x) || typeof n.y !== "number" || isNaN(n.y)) {
      throw new Error(`Invalid coordinate in node ${n.id}`);
    }
  }

  // Test 2: getNetworkNeighborIds
  const neighbors = getNetworkNeighborIds("IS 456", sampleEdges);
  if (!neighbors.direct.has("IS 1786") || !neighbors.direct.has("IS 516 (Pt 1)")) {
    throw new Error("Missing direct neighbors for IS 456");
  }
  if (neighbors.direct.has("IS 694")) {
    throw new Error("Unconnected node IS 694 should not be in direct neighbors");
  }

  // Test 3: computeFocusCamera
  const selectedNode = positioned.find((n) => n.id === "IS 456") as PositionedNode;
  const directNeighborNodes = positioned.filter((n) => neighbors.direct.has(n.id));
  const camera = computeFocusCamera(selectedNode, directNeighborNodes);

  if (typeof camera.pan.x !== "number" || typeof camera.pan.y !== "number" || typeof camera.zoom !== "number") {
    throw new Error("Invalid camera focus result");
  }
  if (camera.zoom < 1.0 || camera.zoom > 1.8) {
    throw new Error(`Camera zoom out of expected bounds: ${camera.zoom}`);
  }

  return true;
}
