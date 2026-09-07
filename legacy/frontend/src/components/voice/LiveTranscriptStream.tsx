import { type FC, useRef, useEffect } from 'react';
import { LiveVoiceTurn } from '@/types';

interface Props {
  interim: string;
  turns: LiveVoiceTurn[];
}

export const LiveTranscriptStream: FC<Props> = ({ interim, turns }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interim, turns]);

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {turns.map((t, i) => (
        <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}>
          <div className={`p-3 rounded-xl max-w-[80%] ${t.role === 'user' ? 'bg-panel border border-border' : 'bg-surface border border-border-highlight'}`}>
            <span className="text-text-primary">{t.text}</span>
          </div>
          <span className="text-xs text-text-muted mt-1">{new Date().toLocaleTimeString()}</span>
        </div>
      ))}
      {interim && (
        <div className="self-end bg-panel border border-border border-dashed p-3 rounded-xl max-w-[80%] opacity-70">
          <span className="text-text-muted italic">{interim}</span>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};
