import type { GraphData } from "@/types";

export interface PositionedNode {
  id: string;
  label: string;
  title: string;
  division: string;
  is_mandatory: boolean;
  status: string;
  x: number;
  y: number;
  clusterId: string;
  isTenderStandard: boolean;
}

export interface NodeRelationItem {
  otherNode?: PositionedNode;
  direction: "outgoing" | "incoming";
  relation: string;
}

export interface ViewportTransform {
  pan: { x: number; y: number };
  zoom: number;
}

export type NetworkFocusState = "selected" | "connected" | "secondary" | "unrelated" | "normal";

export interface GraphEdgeData {
  source: string;
  target: string;
  relation: string;
}

export type { GraphData };
