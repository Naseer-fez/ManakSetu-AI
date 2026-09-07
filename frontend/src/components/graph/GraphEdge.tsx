import React from "react";
import type { PositionedNode } from "@/components/graph/types";

interface GraphEdgeProps {
  sourceNode: PositionedNode;
  targetNode: PositionedNode;
  relation: string;
  isFocused: boolean;
  isHovered: boolean;
  hasActiveSelection: boolean;
}

export const GraphEdge: React.FC<GraphEdgeProps> = ({
  sourceNode,
  targetNode,
  relation,
  isFocused,
  isHovered,
  hasActiveSelection,
}) => {
  const isHighlighted = isFocused || (!hasActiveSelection && isHovered);
  const isDimmed = hasActiveSelection && !isFocused;

  const stroke = isFocused
    ? "url(#edgeHighlight)"
    : isHighlighted
    ? "#30d158"
    : "url(#edgeGrad)";
  const strokeWidth = isFocused ? 3.2 : isHighlighted ? 2.2 : 1.4;
  const opacity = isDimmed ? 0.05 : isHighlighted ? 0.95 : 0.35;
  const isTestMethod = relation === "Test Method";

  const midX = (sourceNode.x + targetNode.x) / 2;
  const midY = (sourceNode.y + targetNode.y) / 2;

  return (
    <g className="transition-opacity duration-300" opacity={opacity}>
      <line
        x1={sourceNode.x}
        y1={sourceNode.y}
        x2={targetNode.x}
        y2={targetNode.y}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={isTestMethod ? "5,4" : undefined}
      />
      {isFocused && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-34}
            y={-9}
            width={68}
            height={18}
            rx={5}
            fill="#0b0d12e6"
            stroke="#30d15888"
            strokeWidth={1}
          />
          <text
            textAnchor="middle"
            y={3.5}
            fill="#30d158"
            fontSize={9}
            fontWeight={600}
            className="select-none pointer-events-none"
          >
            {isTestMethod ? "Test Method" : "Normative"}
          </text>
        </g>
      )}
    </g>
  );
};
