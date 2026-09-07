import { useState, useRef, useEffect, type FC } from 'react';
import { askAssistantStream } from '@/services/standards.service';
import { summarizeContext } from '@/services/pipeline.service';
import { ChatMessageBubble, type ChatBubbleMessage } from '@/components/chat/ChatMessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { AiModeSelector } from '@/components/primitives/AiModeSelector';
import { ErrorState } from '@/components/primitives/ErrorState';
import { RefreshCw, FileText } from 'lucide-react';

export const ChatPage: FC = () => {
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([]);
  const [mode, setMode] = useState<'fast' | 'thinking'>('fast');
  const [isLoading, setIsLoading] = useState(false);
  const [contextSummary, setContextSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleRefreshContext = async (): Promise<void> => {
    try {
      const result = await summarizeContext([{ role: 'system', content: 'Summarize context' }]);
      setContextSummary(result.summarized_context);
    } catch (e) {
      console.error('Failed to refresh context', e);
    }
  };

  const handleSend = async (content: string): Promise<void> => {
    const userMsg: ChatBubbleMessage = { role: 'user', content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      let assistantText = '';
      const placeholder: ChatBubbleMessage = { role: 'assistant', content: '', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, placeholder]);

      const history = messages.map(m => ({ role: m.role, content: m.content }));
      await askAssistantStream(content, (chunk: string) => {
        assistantText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: assistantText };
          return updated;
        });
      }, null, history);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="p-4 border-b border-border bg-panel flex justify-between items-center shrink-0">
        <AiModeSelector mode={mode} onModeChange={(m) => setMode(m as 'fast' | 'thinking')} />
        <div className="flex items-center gap-4">
          {contextSummary && (
            <div className="flex items-center gap-2 text-xs text-text-muted bg-surface px-3 py-1.5 rounded-full border border-border">
              <FileText className="w-3 h-3" />
              <span className="truncate max-w-[200px]">Context active</span>
            </div>
          )}
          <button onClick={handleRefreshContext} className="text-text-secondary hover:text-text-primary p-2">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center mt-20 text-text-muted">
              <p className="text-lg mb-2">How can I help you with BIS standards today?</p>
              <p className="text-sm">Ask about QCOs, tender clauses, or standard requirements.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessageBubble key={i} message={msg} />
          ))}
          {isLoading && (
            <div className="flex gap-1 ml-4 mb-4">
              <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          {error && <ErrorState message={error} />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
};
