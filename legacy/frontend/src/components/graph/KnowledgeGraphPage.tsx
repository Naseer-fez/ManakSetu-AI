import { useState, useEffect, type FC } from 'react';
import { ForceGraph } from '@/components/graph/ForceGraph';
import { GraphControls } from '@/components/graph/GraphControls';
import { NodeInspector } from '@/components/graph/NodeInspector';
import { RadialGraphIntro } from '@/components/graph/RadialGraphIntro';
import { GraphFallbackList } from '@/components/graph/GraphFallbackList';
import { GraphData, GraphNode } from '@/types';
import { fetchKnowledgeGraph } from '@/services/qco.service';

export const KnowledgeGraphPage: FC = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetchKnowledgeGraph().then(res => {
      setData(res);
      setTimeout(() => setIsLoading(false), 1500); // allow intro animation to play
    }).catch(console.error);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-canvas overflow-hidden">
      <div className="absolute top-4 left-4 z-20 flex gap-2 bg-surface p-1 rounded-lg border border-border">
        <button
          onClick={() => setViewMode('graph')}
          className={`px-3 py-1 rounded-md text-sm ${viewMode === 'graph' ? 'bg-panel text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
        >
          Graph
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-1 rounded-md text-sm ${viewMode === 'list' ? 'bg-panel text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
        >
          List
        </button>
      </div>

      {isLoading && viewMode === 'graph' && <RadialGraphIntro />}

      {viewMode === 'graph' ? (
        <>
          <div className="flex-1 relative">
            <ForceGraph data={data} onSelectNode={setSelectedNode} />
          </div>
          <GraphControls
            zoom={zoom}
            onZoomIn={() => setZoom(z => Math.min(2, z + 0.2))}
            onZoomOut={() => setZoom(z => Math.max(0.5, z - 0.2))}
            onReset={() => setZoom(1)}
          />
          {selectedNode && data && (
            <NodeInspector node={selectedNode} edges={data.edges} onClose={() => setSelectedNode(null)} />
          )}
        </>
      ) : (
        <GraphFallbackList data={data} />
      )}
    </div>
  );
};
