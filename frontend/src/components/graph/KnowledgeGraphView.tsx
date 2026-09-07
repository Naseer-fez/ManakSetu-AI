import React, { useCallback } from "react";
import { Share2, ShieldAlert } from "lucide-react";
import type { PositionedNode } from "@/components/graph/types";
import { useGraphData } from "@/components/graph/useGraphData";
import { useGraphCamera } from "@/components/graph/useGraphCamera";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { GraphHeaderFilter } from "@/components/graph/GraphHeaderFilter";
import { GraphZoomControls } from "@/components/graph/GraphZoomControls";
import { GraphInspectorPanel } from "@/components/graph/GraphInspectorPanel";
import { GraphLegend } from "@/components/graph/GraphLegend";
import { GraphTenderBanner } from "@/components/graph/GraphTenderBanner";

export const KnowledgeGraphView: React.FC = () => {
  const data = useGraphData();
  const cam = useGraphCamera(() => data.setSelectedNodeId(null));

  const handleSelectNode = useCallback((node: PositionedNode) => {
    data.setSelectedNodeId(node.id);
    const directIds = Array.from(data.directNeighbors);
    const neighbors = directIds.map((id) => data.nodeMap.get(id)).filter((n): n is PositionedNode => Boolean(n));
    cam.focusOnNode(node, neighbors);
  }, [data, cam]);

  const handleBackgroundClick = () => {
    if (!cam.hasMoved.current && data.selectedNodeId) cam.resetCamera();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#091524] select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <GraphHeaderFilter
        divisions={data.divisions}
        selectedDivision={data.selectedDivision}
        onSelectDivision={data.setSelectedDivision}
        searchQuery={data.searchQuery}
        onSearchChange={data.setSearchQuery}
      />

      <GraphZoomControls
        onZoomIn={() => cam.setZoom((z) => Math.min(2.5, Number((z + 0.2).toFixed(2))))}
        onZoomOut={() => cam.setZoom((z) => Math.max(0.4, Number((z - 0.2).toFixed(2))))}
        onReset={cam.resetCamera} onReload={data.loadData} loading={data.loading}
      />

      <GraphTenderBanner tenderCount={data.tenderStandardsCount} />
      <GraphLegend />

      <div className="w-full h-full flex items-center justify-center">
        {data.loading && !data.graphData ? (
          <div className="text-center space-y-3 z-10 animate-pulse">
            <Share2 className="w-8 h-8 text-gov-blue mx-auto animate-spin" />
            <p className="text-sm font-medium text-gray-300">Constructing Clustered BIS Standards Graph...</p>
          </div>
        ) : data.error ? (
          <div className="text-center space-y-3 z-10">
            <ShieldAlert className="w-8 h-8 text-gov-amber mx-auto" />
            <p className="text-sm text-gray-300">Failed to load knowledge graph data.</p>
            <button onClick={data.loadData} className="px-4 py-2 bg-gov-navy text-white rounded border border-gray-600 text-xs font-semibold">Retry</button>
          </div>
        ) : (
          <GraphCanvas
            nodes={data.activeNodes}
            edges={data.visibleEdges}
            nodeMap={data.nodeMap}
            selectedNodeId={data.selectedNodeId}
            hoveredNodeId={data.hoveredNodeId}
            directNeighbors={data.directNeighbors}
            secondaryNeighbors={data.secondaryNeighbors}
            pan={cam.pan}
            zoom={cam.zoom}
            isDragging={cam.isDragging}
            onMouseDown={cam.handleMouseDown}
            onMouseMove={cam.handleMouseMove}
            onMouseUp={cam.handleMouseUp}
            onNodeClick={handleSelectNode}
            onNodeHover={(node) => data.setHoveredNodeId(node.id)}
            onNodeLeave={() => data.setHoveredNodeId(null)}
            onBackgroundClick={handleBackgroundClick}
          />
        )}
      </div>

      <GraphInspectorPanel
        selectedNode={data.selectedNode}
        relations={data.selectedNodeRelations}
        zoom={cam.zoom}
        onClose={cam.resetCamera}
        onSelectNodeId={(id) => {
          const target = data.nodeMap.get(id);
          if (target) handleSelectNode(target);
        }}
      />
    </div>
  );
};

export default KnowledgeGraphView;
