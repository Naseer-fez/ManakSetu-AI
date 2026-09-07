import React from "react";
import type { PositionedNode, GraphEdgeData } from "./types";
import { GraphEdge } from "./GraphEdge";

interface GraphEdgesLayerProps {
  edges: GraphEdgeData[];
  nodeMap: Map<string, PositionedNode>;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
}

export const GraphEdgesLayer: React.FC<GraphEdgesLayerProps> = ({
  edges,
  nodeMap,
  selectedNodeId,
  hoveredNodeId,
}) => (
  <g className="edges">
    {edges.map((edge, idx) => {
      const s = nodeMap.get(edge.source);
      const t = nodeMap.get(edge.target);
      if (!s || !t) return null;
      return (
        <GraphEdge
          key={`${edge.source}-${edge.target}-${idx}`}
          sourceNode={s}
          targetNode={t}
          relation={edge.relation}
          isFocused={Boolean(selectedNodeId) && (edge.source === selectedNodeId || edge.target === selectedNodeId)}
          isHovered={Boolean(hoveredNodeId) && (edge.source === hoveredNodeId || edge.target === hoveredNodeId)}
          hasActiveSelection={Boolean(selectedNodeId)}
        />
      );
    })}
  </g>
);
