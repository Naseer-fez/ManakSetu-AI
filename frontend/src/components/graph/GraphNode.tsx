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

/** Truncate IS code title to a short label that fits inside the node ball. */
function abbreviateTitle(title: string, maxLen: number): string {
  const cleaned = title.replace(/Indian Standard[\s:–-]*/i, "").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen - 1) + "…";
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

  const baseRadius = node.is_mandatory ? 28 : 24;
  const radius = isSelected ? baseRadius + 8 : isHovered ? baseRadius + 4 : baseRadius;
  const themeColor = node.is_mandatory ? "#ff453a" : "#0a84ff";
  const strokeColor = isSelected ? "#ffffff" : isConnected ? "#30d158" : themeColor;

  const opacity = isUnrelated ? 0.1 : isSecondary ? 0.38 : 1;

  // Determine what text to show inside the ball
  const showTitle = isSelected || isHovered;
  const codeLabel = node.label;
  const titleLabel = abbreviateTitle(node.title, isSelected ? 20 : 16);

  // Font size scales down for longer codes
  const codeFontSize = codeLabel.length > 8 ? 8 : codeLabel.length > 6 ? 9 : 10;

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node);
      }}
      onMouseEnter={() => onMouseEnter(node)}
      onMouseLeave={onMouseLeave}
      className="cursor-pointer"
      opacity={opacity}
      filter={isUnrelated ? "url(#unrelatedBlur)" : undefined}
      style={{ transition: "opacity 0.25s ease" }}
    >
      {/* Outer animated ping ring — selected state */}
      {isSelected && (
        <>
          <circle
            r={radius + 18}
            fill="none"
            stroke={themeColor}
            strokeWidth={1.5}
            opacity={0.25}
            style={{ animation: "ping 1.4s cubic-bezier(0,0,0.2,1) infinite" }}
          />
          <circle r={radius + 10} fill="none" stroke={strokeColor} strokeWidth={2.5} opacity={0.75} />
        </>
      )}

      {/* Hover dashed ring */}
      {(isConnected || isHovered) && !isSelected && (
        <circle
          r={radius + 7}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.8}
          opacity={0.65}
          strokeDasharray="4,3"
          style={{ transition: "r 0.2s ease, opacity 0.2s ease" }}
        />
      )}

      {/* Soft glow behind the node when selected/hovered */}
      {(isSelected || isHovered) && (
        <circle
          r={radius + 4}
          fill={themeColor}
          opacity={isSelected ? 0.22 : 0.1}
          style={{ transition: "opacity 0.2s ease" }}
        />
      )}

      {/* Main node body */}
      <circle
        r={radius}
        fill={isSelected ? themeColor : isHovered ? "#1a1d26" : "#141416"}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3.5 : isConnected ? 2.5 : 1.8}
        style={{ transition: "r 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.2s ease, stroke 0.2s ease" }}
      />

      {/* Inner radial gradient overlay for depth */}
      <circle
        r={radius * 0.6}
        fill="white"
        opacity={isSelected ? 0.06 : 0.04}
        transform={`translate(${-radius * 0.22}, ${-radius * 0.22})`}
        style={{ pointerEvents: "none" }}
      />

      {/* IS Code — always shown inside the ball (line 1) */}
      <text
        textAnchor="middle"
        y={showTitle ? -3 : 4}
        fill={isSelected ? "#ffffff" : isHovered ? "#ffffff" : isConnected ? "#30d158" : "#e0e0e0"}
        fontSize={codeFontSize}
        fontWeight={700}
        letterSpacing="0.3"
        className="select-none pointer-events-none"
        style={{ transition: "y 0.2s ease, fill 0.2s ease", fontFamily: "monospace" }}
      >
        {codeLabel}
      </text>

      {/* Title abbreviation — only on hover or select (line 2) */}
      <text
        textAnchor="middle"
        y={showTitle ? 10 : 4}
        fill={isSelected ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.55)"}
        fontSize={7}
        fontWeight={400}
        className="select-none pointer-events-none"
        opacity={showTitle ? 1 : 0}
        style={{ transition: "opacity 0.2s ease, y 0.2s ease" }}
      >
        {titleLabel}
      </text>

      {/* Mandatory indicator dot */}
      <circle
        r={node.is_mandatory ? 4.5 : 3.5}
        fill={isSelected ? "#ffffff" : themeColor}
        cy={-radius * 0.48}
        cx={radius * 0.48}
        style={{ transition: "fill 0.2s ease" }}
      />
    </g>
  );
};
