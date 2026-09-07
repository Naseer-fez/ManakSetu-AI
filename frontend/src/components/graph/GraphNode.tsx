import React from "react";
import type { PositionedNode, NetworkFocusState } from "@/components/graph/types";

interface GraphNodeProps {
  node: PositionedNode;
  focusState: NetworkFocusState;
  isHovered: boolean;
  onClick: (node: PositionedNode) => void;
  onMouseEnter: (node: PositionedNode) => void;
  onMouseLeave: () => void;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  node,
  focusState,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isSelected = focusState === "selected";
  const isConnected = focusState === "connected";
  const isUnrelated = focusState === "unrelated";
  const isSecondary = focusState === "secondary";

  const baseRadius = node.is_mandatory ? 26 : 22;
  const radius = isSelected ? baseRadius + 7 : isHovered ? baseRadius + 3 : baseRadius;
  const themeColor = node.is_mandatory ? "#ff453a" : "#0a84ff";
  const strokeColor = isSelected ? "#ffffff" : isConnected ? "#30d158" : themeColor;

  const opacity = isUnrelated ? 0.12 : isSecondary ? 0.4 : 1;
  const labelWidth = Math.max(64, node.label.length * 7 + 16);

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node);
      }}
      onMouseEnter={() => onMouseEnter(node)}
      onMouseLeave={onMouseLeave}
      className="cursor-pointer transition-transform duration-200"
      opacity={opacity}
      filter={isUnrelated ? "url(#unrelatedBlur)" : undefined}
    >
      {isSelected && (
        <>
          <circle r={radius + 16} fill="none" stroke={themeColor} strokeWidth={1.5} opacity={0.3} className="animate-ping" />
          <circle r={radius + 9} fill="none" stroke={strokeColor} strokeWidth={2.5} opacity={0.8} />
        </>
      )}

      {(isConnected || isHovered) && !isSelected && (
        <circle r={radius + 6} fill="none" stroke={strokeColor} strokeWidth={2} opacity={0.7} strokeDasharray="3,3" />
      )}

      <circle
        r={radius}
        fill={isSelected ? themeColor : "#141416"}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3.5 : isConnected ? 2.5 : 1.8}
        className="transition-all duration-200"
      />

      <circle r={node.is_mandatory ? 5 : 4} fill={isSelected ? "#ffffff" : themeColor} cy={-radius * 0.45} />

      <g transform={`translate(0, ${radius + 14})`}>
        <rect
          x={-labelWidth / 2}
          y={-10}
          width={labelWidth}
          height={20}
          rx={6}
          fill={isSelected ? themeColor : "#0d0e12ee"}
          stroke={isSelected ? "#ffffff" : isConnected ? "#30d15888" : "#ffffff18"}
          strokeWidth={isSelected ? 1.5 : 1}
        />
        <text
          textAnchor="middle"
          y={4}
          fill="#ffffff"
          fontSize={isSelected ? 12 : 11}
          fontWeight={isSelected || isConnected ? 700 : 500}
          className="select-none pointer-events-none"
        >
          {node.label}
        </text>
      </g>
    </g>
  );
};
