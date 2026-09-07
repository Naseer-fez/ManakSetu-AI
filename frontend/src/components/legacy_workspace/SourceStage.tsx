import { type FC } from 'react';
import { Upload, FileText } from 'lucide-react';
import { MotionButton } from '../legacy_primitives/MotionButton';
import { cn } from '../../lib/utils';
import { LoadingState } from '../legacy_primitives/LoadingState';

interface SourceStageProps {
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  rawText: string;
  setRawText: (text: string) => void;
  sourceMode: 'upload' | 'paste';
  setSourceMode: (mode: 'upload' | 'paste') => void;
  onRunAudit: () => void;
  busy: boolean;
}

export const SourceStage: FC<SourceStageProps> = ({
  workspaceName, setWorkspaceName, selectedFile, setSelectedFile,
  rawText, setRawText, sourceMode, setSourceMode, onRunAudit, busy
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-surface border border-border rounded-xl p-6">
      <input 
        value={workspaceName} 
        onChange={e => setWorkspaceName(e.target.value)}
        className="text-2xl font-bold bg-transparent text-text-primary border-b border-border-subtle mb-6 outline-none"
      />
      <div className="flex items-center gap-4 mb-4 text-sm font-medium">
        <button 
          onClick={() => setSourceMode('upload')}
          className={cn("pb-1", sourceMode === 'upload' ? "text-ruby border-b-2 border-ruby" : "text-text-muted")}
        >
          Upload file
        </button>
        <span className="text-border">/</span>
        <button 
          onClick={() => setSourceMode('paste')}
          className={cn("pb-1", sourceMode === 'paste' ? "text-ruby border-b-2 border-ruby" : "text-text-muted")}
        >
          Paste text
        </button>
      </div>
      
      <div className="mb-6 h-64 border-2 border-dashed border-border-subtle rounded-lg p-4">
        {sourceMode === 'upload' ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <Upload className="w-12 h-12 mb-2 text-text-muted" />
            <p>Drag and drop or click to upload</p>
            <p className="text-xs text-text-muted mt-1">Accepts PDF, DOCX, TXT, Images</p>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }}
            />
            {selectedFile && <div className="mt-4 flex items-center gap-2 text-text-primary"><FileText size={16} />{selectedFile.name}</div>}
          </div>
        ) : (
          <textarea 
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            className="w-full h-full bg-transparent resize-none outline-none text-text-primary"
            placeholder="Paste your source text here..."
          />
        )}
      </div>

      <div className="flex justify-end">
        {busy ? <LoadingState /> : (
          <MotionButton variant="ruby" onClick={onRunAudit} disabled={busy}>
            Run audit
          </MotionButton>
        )}
      </div>
    </div>
  );
};

