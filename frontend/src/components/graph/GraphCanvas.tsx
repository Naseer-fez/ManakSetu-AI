import React from "react";
import type { PositionedNode, GraphEdgeData, NetworkFocusState } from "@/components/graph/types";
import { GraphNode } from "@/components/graph/GraphNode";
import { GraphEdgesLayer } from "@/components/graph/GraphEdgesLayer";

interface GraphCanvasProps {
  nodes: PositionedNode[];
  edges: GraphEdgeData[];
  nodeMap: Map<string, PositionedNode>;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  directNeighbors: Set<string>;
  secondaryNeighbors: Set<string>;
  pan: { x: number; y: number };
  zoom: number;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onNodeClick: (node: PositionedNode) => void;
  onNodeHover: (node: PositionedNode) => void;
  onNodeLeave: () => void;
  onBackgroundClick: () => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes, edges, nodeMap, selectedNodeId, hoveredNodeId,
  directNeighbors, secondaryNeighbors, pan, zoom, isDragging,
  onMouseDown, onMouseMove, onMouseUp, onNodeClick, onNodeHover,
  onNodeLeave, onBackgroundClick,
}) => {
  const getNodeFocus = (id: string): NetworkFocusState => {
    if (!selectedNodeId) return "normal";
    if (id === selectedNodeId) return "selected";
    if (directNeighbors.has(id)) return "connected";
    if (secondaryNeighbors.has(id)) return "secondary";
    return "unrelated";
  };

  const sortedNodes = [...nodes].sort((a, b) => {
    const rank = (id: string) => (id === selectedNodeId ? 3 : directNeighbors.has(id) ? 2 : 1);
    return rank(a.id) - rank(b.id);
  });

  return (
    <svg
      className="w-full h-full select-none"
      viewBox="-650 -480 1300 960"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onClick={onBackgroundClick}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <defs>
        <filter id="unrelatedBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      <g
        transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
        style={{
          transformOrigin: "0px 0px",
          transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <GraphEdgesLayer
          edges={edges}
          nodeMap={nodeMap}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
        />

        <g className="nodes">
          {sortedNodes.map((node) => (
            <GraphNode
              key={node.id}
              node={node}
              focusState={getNodeFocus(node.id)}
              isHovered={hoveredNodeId === node.id}
              onClick={onNodeClick}
              onMouseEnter={onNodeHover}
              onMouseLeave={onNodeLeave}
            />
          ))}
        </g>
      </g>
    </svg>
  );
};
export default GraphCanvas;
