import { useState, type FC } from 'react';
import { GraphData } from '@/types';

interface Props {
  data: GraphData | null;
}

export const GraphFallbackList: FC<Props> = ({ data }) => {
  const [search, setSearch] = useState('');

  if (!data) return <div className="p-4 text-text-muted">No data available</div>;

  const filtered = data.nodes.filter(n => n.label.toLowerCase().includes(search.toLowerCase()) || n.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-canvas p-4">
      <input
        type="text"
        placeholder="Search nodes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 bg-surface border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-ruby"
      />
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {filtered.map(n => (
          <div key={n.id} className="bg-panel p-4 rounded-xl border border-border">
            <h4 className="text-text-primary font-medium">{n.id}</h4>
            <p className="text-sm text-text-muted">{n.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
