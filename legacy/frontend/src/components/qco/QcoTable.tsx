import { type FC } from 'react';
import type { MandatoryQCO } from '@/types';

interface QcoTableRow extends MandatoryQCO {
  is_code: string;
}

interface QcoTableProps {
  data: QcoTableRow[];
  onRowClick: (qco: QcoTableRow) => void;
}

export const QcoTable: FC<QcoTableProps> = ({ data, onRowClick }) => {
  return (
    <div className="w-full overflow-auto bg-panel rounded-xl border border-border">
      <table className="w-full text-left text-sm text-text-secondary">
        <thead className="text-xs text-text-muted bg-surface sticky top-0 z-10 border-b border-border">
          <tr>
            <th className="px-6 py-3 font-medium">Standard Code</th>
            <th className="px-6 py-3 font-medium">Scheme</th>
            <th className="px-6 py-3 font-medium">Order Number</th>
            <th className="px-6 py-3 font-medium">Ministry</th>
            <th className="px-6 py-3 font-medium">Effective Date</th>
            <th className="px-6 py-3 font-medium text-center">Mandatory</th>
          </tr>
        </thead>
        <tbody>
          {data.map((qco, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick(qco)}
              className="border-b border-border hover:bg-subtle cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                {qco.is_code ?? qco.order_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{qco.scheme}</td>
              <td className="px-6 py-4 whitespace-nowrap">{qco.order_number}</td>
              <td className="px-6 py-4 truncate max-w-[200px]">{qco.issuing_ministry}</td>
              <td className="px-6 py-4 whitespace-nowrap">{qco.effective_date}</td>
              <td className="px-6 py-4 text-center">
                <span className="inline-block w-2 h-2 rounded-full bg-ruby" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
