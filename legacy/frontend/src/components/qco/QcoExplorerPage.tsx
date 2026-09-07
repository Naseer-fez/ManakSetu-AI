import { useState, useEffect, type FC } from 'react';
import { fetchQcoList } from '@/services/qco.service';
import type { MandatoryQCO } from '@/types';
import { QcoTable } from '@/components/qco/QcoTable';
import { QcoInspector } from '@/components/qco/QcoInspector';
import { LoadingState } from '@/components/primitives/LoadingState';
import { ErrorState } from '@/components/primitives/ErrorState';
import { Search } from 'lucide-react';

export interface QcoEntry extends MandatoryQCO {
  is_code: string;
}

export const QcoExplorerPage: FC = () => {
  const [qcoData, setQcoData] = useState<QcoEntry[]>([]);
  const [selectedQco, setSelectedQco] = useState<QcoEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetchQcoList()
      .then(data => {
        const entries: QcoEntry[] = Object.entries(data).map(([code, qco]) => ({ ...qco, is_code: code }));
        setQcoData(entries);
      })
      .catch(e => setError(e as Error))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredData = qcoData.filter(qco =>
    qco.is_code.toLowerCase().includes(search.toLowerCase()) ||
    qco.issuing_ministry.toLowerCase().includes(search.toLowerCase()) ||
    qco.order_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-surface relative overflow-hidden">
      <div className="p-6 border-b border-border bg-panel flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by IS code, ministry, or order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-ruby transition-colors"
          />
        </div>
        {search && (
          <button onClick={() => setSearch('')} className="text-sm text-text-muted hover:text-text-primary">
            Clear
          </button>
        )}
        <div className="text-sm text-text-muted ml-auto">
          {filteredData.length} items
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        {isLoading ? <LoadingState /> : error ? <ErrorState message={error.message} /> : (
          <QcoTable data={filteredData} onRowClick={setSelectedQco} />
        )}
      </div>

      <QcoInspector qco={selectedQco} onClose={() => setSelectedQco(null)} />
    </div>
  );
};
