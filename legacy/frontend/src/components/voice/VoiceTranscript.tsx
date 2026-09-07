import { type FC } from 'react';
import { VoiceChatMessage, DocumentChunkEvidence } from '@/types';
import { CopyAction } from '@/components/primitives/CopyAction';

interface Props {
  messages: VoiceChatMessage[];
}

export const VoiceTranscript: FC<Props> = ({ messages }) => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4 flex-1">
      {messages.map((m, i) => (
        <div key={i} className={`flex flex-col max-w-[80%] ${m.role === 'user' ? 'self-end bg-panel border-border-highlight' : 'self-start bg-surface border-border'} border rounded-xl p-3`}>
          <div className="flex justify-between items-start gap-4">
            <span className="text-text-primary whitespace-pre-wrap">{m.content}</span>
            {m.role === 'assistant' && <CopyAction content={m.content} />}
          </div>
          {(m as any).document_evidences && ((m as any).document_evidences as DocumentChunkEvidence[]).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-muted">
              {((m as any).document_evidences as DocumentChunkEvidence[]).map((e, idx) => (
                <span key={idx} className="bg-canvas px-2 py-1 rounded">{e.file_name}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
