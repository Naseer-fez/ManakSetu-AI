import { type FC } from 'react';
import { GraphNode, GraphEdge } from '@/types';
import { StatusToken } from '@/components/primitives/StatusToken';
import { X } from 'lucide-react';

interface Props {
  node: GraphNode;
  edges: GraphEdge[];
  onClose: () => void;
}

export const NodeInspector: FC<Props> = ({ node, edges, onClose }) => {
  return (
    <div className="absolute top-4 right-4 w-80 bg-surface border border-border rounded-xl shadow-xl flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-start p-4 border-b border-border">
        <div>
          <h3 className="text-text-primary font-medium">{node.id}</h3>
          <p className="text-sm text-text-muted mt-1">{node.label}</p>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X size={20} />
        </button>
      </div>
      <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
        <div>
          <div className="text-xs text-text-muted mb-1">Status</div>
          <StatusToken status={node.is_mandatory ? 'COMPLIANT' : 'NEEDS_VERIFICATION'} />
        </div>
        <div>
          <div className="text-xs text-text-muted mb-1">Division</div>
          <div className="text-sm text-text-primary">{node.division}</div>
        </div>
        <div>
          <div className="text-xs text-text-muted mb-2">Connections</div>
          <div className="flex flex-col gap-2">
            {edges.filter(e => e.source === node.id || e.target === node.id).map((e, i) => (
              <div key={i} className="text-xs bg-panel p-2 rounded border border-border-subtle text-text-secondary">
                {e.relation}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
