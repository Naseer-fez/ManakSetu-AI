import { useState, type FC } from 'react';
import { chatWorkspace } from '../../legacy_services/workspace.service';
import { MotionButton } from '../legacy_primitives/MotionButton';
import { CopyAction } from '../legacy_primitives/CopyAction';
import { Send } from 'lucide-react';

interface WorkspaceChatProps {
  workspaceId: string;
}

export const WorkspaceChat: FC<WorkspaceChatProps> = ({ workspaceId }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;
    try {
      setBusy(true);
      const res = await chatWorkspace(workspaceId, question);
      setAnswer(res.answer);
    } catch (e) {
      setAnswer('Error communicating with AI.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-panel border border-border rounded-xl p-4 m-6 mb-0">
      <div className="flex items-center gap-2 mb-4">
        <input 
          className="flex-1 bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-ruby"
          placeholder="Ask a question about this workspace..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <MotionButton variant="ruby" size="icon" onClick={handleSend} isLoading={busy}>
          <Send className="w-4 h-4" />
        </MotionButton>
      </div>
      
      {answer && (
        <div className="bg-surface p-3 rounded-lg border border-border-subtle relative group">
          <p className="text-sm text-text-primary pr-8">{answer}</p>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyAction content={answer} />
          </div>
          <div className="mt-2 flex justify-end">
            <span className="text-[10px] text-text-muted">Grounded in workspace evidence</span>
          </div>
        </div>
      )}
    </div>
  );
};

