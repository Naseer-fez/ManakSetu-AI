import { useState, type FC } from 'react';
import { MotionButton } from '../legacy_primitives/MotionButton';
import { exportWorkspace } from '../../legacy_services/workspace.service';
import { Download } from 'lucide-react';

interface TemplateExportStageProps {
  workspaceId: string;
  isBlocked: boolean;
  isRevisionApproved: boolean;
}

export const TemplateExportStage: FC<TemplateExportStageProps> = ({ workspaceId, isBlocked, isRevisionApproved }) => {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    try {
      setBusy(true);
      const data = await exportWorkspace(workspaceId, { format: 'json', template: { template_id: 'default' } as any, values: {} });
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${workspaceId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const disabled = isBlocked || !isRevisionApproved;

  return (
    <div className="bg-panel border border-border rounded-xl p-4">
      <h3 className="text-lg text-text-primary font-semibold mb-2">Export</h3>
      {disabled && (
        <p className="text-sm text-text-warning mb-4">
          {isBlocked ? 'Export blocked due to non-compliant findings.' : 'Revision must be approved before export.'}
        </p>
      )}
      
      <div className="flex gap-4">
        <MotionButton variant="outline" onClick={() => {}}>
          Create draft
        </MotionButton>
        <MotionButton 
          variant="ruby" 
          disabled={disabled || busy} 
          isLoading={busy}
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" /> Export reviewed
        </MotionButton>
      </div>
    </div>
  );
};

