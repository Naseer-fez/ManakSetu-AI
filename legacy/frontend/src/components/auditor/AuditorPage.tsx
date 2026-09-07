import { useState, type FC } from 'react';
import { Upload, FileText } from 'lucide-react';
import { MotionButton } from '@/components/primitives/MotionButton';
import { DocumentReadingView } from './DocumentReadingView';
import { ComplianceFindings } from './ComplianceFindings';
import { analyzeTender } from '@/services/tender.service';
import type { TenderAnalysisReport } from '@/types';
import { LoadingState } from '@/components/primitives/LoadingState';
import { ErrorState } from '@/components/primitives/ErrorState';

interface AuditorPageProps {
  onNavigate: (page: string) => void;
  onSetPdfText: (text: string) => void;
}

export const AuditorPage: FC<AuditorPageProps> = ({ onNavigate, onSetPdfText }) => {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<TenderAnalysisReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setBusy(true);
      setError(null);
      const res = await analyzeTender({ rawText: file ? file.name : 'Sample Tender Text' } as any);
      setReport(res);
      if (res.items && res.items.length > 0) {
        onSetPdfText('Sample Extracted Text');
      }
    } catch (e: any) {
      setError(e.message || 'Error analyzing tender');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas p-6 flex flex-col">
      {!report ? (
        <div className="max-w-2xl mx-auto bg-surface border border-border rounded-xl p-6 w-full">
          <h2 className="text-xl font-bold text-text-primary mb-6">Document Intake</h2>
          {error && <ErrorState message={error} />}
          <div className="mb-6 h-64 border-2 border-dashed border-border-subtle rounded-lg p-4 flex flex-col items-center justify-center text-text-secondary cursor-pointer hover:bg-subtle transition-colors"
               onClick={() => {
                 const fakeFile = new File([""], "tender.pdf", { type: "application/pdf" });
                 setFile(fakeFile);
               }}>
            <Upload className="w-12 h-12 mb-2 text-text-muted" />
            <p>Upload Tender Document</p>
            <p className="text-xs text-text-muted mt-1">Accepts PDF, DOCX</p>
            {file && <div className="mt-4 flex items-center gap-2 text-text-primary"><FileText size={16} />{file.name}</div>}
          </div>
          <div className="flex justify-end">
            {busy ? <LoadingState /> : (
              <MotionButton variant="ruby" onClick={handleAnalyze} disabled={!file}>
                Analyze Tender
              </MotionButton>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 flex-1 max-w-5xl mx-auto w-full">
          <div className="flex justify-between items-center bg-panel border border-border p-4 rounded-xl">
            <h2 className="text-xl font-bold text-text-primary">Tender Analysis Report</h2>
            <MotionButton variant="primary" onClick={() => onNavigate('workspace')}>
              Continue in Workspace
            </MotionButton>
          </div>
          <DocumentReadingView items={report.items} />
          <ComplianceFindings report={report} />
        </div>
      )}
    </div>
  );
};

