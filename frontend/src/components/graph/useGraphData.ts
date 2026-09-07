import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchKnowledgeGraph } from "@/services/api.service";
import { useRemembrance } from "@/context/RemembranceContext";
import type { GraphData } from "@/types";
import type { PositionedNode, NodeRelationItem } from "@/components/graph/types";
import { computeClusteredLayout, getNetworkNeighborIds } from "@/components/graph/graph-physics.utils";

export function useGraphData() {
  const rem = useRemembrance();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError(false);
    try { setGraphData(await fetchKnowledgeGraph()); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const tenderStandards = useMemo(() => {
    const s = new Set<string>();
    Object.values(rem.tabs).forEach(tab => {
      if (!tab.analysis?.report?.items) return;
      tab.analysis.report.items.forEach((item) => {
        item.cited_standards.forEach((c) => s.add(c.trim().toUpperCase()));
        item.recommended_standards.forEach((r) => {
          s.add(r.standard.is_code.trim().toUpperCase());
          r.allied_standards?.forEach((a) => s.add(a.is_code.trim().toUpperCase()));
        });
      });
    });
    return s;
  }, [rem.tabs]);

  const positionedNodes = useMemo(() => {
    if (!graphData?.nodes?.length) return [];
    return computeClusteredLayout(graphData.nodes, graphData.edges || []).map(n => ({
      ...n,
      isTenderStandard: tenderStandards.has(n.label.toUpperCase()) || tenderStandards.has(n.id.toUpperCase()),
    }));
  }, [graphData, tenderStandards]);

  const nodeMap = useMemo(() => new Map(positionedNodes.map(n => [n.id, n])), [positionedNodes]);
  const divisions = useMemo(() => !graphData?.nodes ? ["All"] : ["All", ...Array.from(new Set(graphData.nodes.map(n => n.division).filter(Boolean)))], [graphData]);

  const filteredNodeIds = useMemo(() => {
    const ids = new Set<string>();
    const q = searchQuery.trim().toLowerCase();
    positionedNodes.forEach((n) => {
      const matchTender = !rem.graphFocusTender || n.isTenderStandard;
      const matchDiv = selectedDivision === "All" || n.division === selectedDivision;
      const matchQuery = !q || n.label.toLowerCase().includes(q) || n.title.toLowerCase().includes(q);
      if (matchTender && matchDiv && matchQuery) ids.add(n.id);
    });
    return ids;
  }, [positionedNodes, selectedDivision, searchQuery, rem.graphFocusTender]);

  const activeNodes = useMemo(() => positionedNodes.filter((n) => filteredNodeIds.has(n.id)), [positionedNodes, filteredNodeIds]);

  const visibleEdges = useMemo(() => {
    if (!graphData?.edges) return [];
    return graphData.edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  }, [graphData, filteredNodeIds]);

  const { direct: directNeighbors, secondary: secondaryNeighbors } = useMemo(() => {
    return getNetworkNeighborIds(selectedNodeId, visibleEdges);
  }, [selectedNodeId, visibleEdges]);

  const selectedNode = useMemo(() => (selectedNodeId ? nodeMap.get(selectedNodeId) || null : null), [selectedNodeId, nodeMap]);

  const selectedNodeRelations = useMemo<NodeRelationItem[]>(() => {
    if (!selectedNodeId || !graphData?.edges) return [];
    return graphData.edges
      .filter((e) => e.source === selectedNodeId || e.target === selectedNodeId)
      .map((e) => ({
        otherNode: nodeMap.get(e.source === selectedNodeId ? e.target : e.source),
        direction: (e.source === selectedNodeId ? "outgoing" : "incoming") as "outgoing" | "incoming",
        relation: e.relation,
      }))
      .filter((r): r is NodeRelationItem & { otherNode: PositionedNode } => Boolean(r.otherNode));
  }, [selectedNodeId, graphData, nodeMap]);

  return {
    graphData, loading, error, loadData, divisions,
    selectedDivision, setSelectedDivision, searchQuery, setSearchQuery,
    selectedNodeId, setSelectedNodeId, hoveredNodeId, setHoveredNodeId,
    activeNodes, visibleEdges, nodeMap, selectedNode, selectedNodeRelations,
    directNeighbors, secondaryNeighbors, tenderStandardsCount: tenderStandards.size,
  };
}
