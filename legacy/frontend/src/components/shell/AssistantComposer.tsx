import { useState, type FC, type KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AssistantComposerProps {
  onSendMessage: (content: string) => void;
  isStreaming?: boolean;
  onStopStreaming?: () => void;
  disabled?: boolean;
  className?: string;
}

export const AssistantComposer: FC<AssistantComposerProps> = ({
  onSendMessage,
  isStreaming = false,
  onStopStreaming,
  disabled = false,
  className,
}) => {
  const [text, setText] = useState<string>('');

  const handleSend = (): void => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSendMessage(trimmed);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer className={cn('p-3.5 border-t border-border bg-surface/90 select-none', className)}>
      <div className="relative flex items-end gap-2 bg-panel border border-border rounded-xl p-2 focus-within:border-ruby/50 transition-colors">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask procurement questions or Indian Standards compliance..."
          rows={2}
          disabled={disabled}
          className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none resize-none px-1"
          aria-label="Assistant question input"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStopStreaming}
            aria-label="Stop generating"
            className="shrink-0 p-2 rounded-lg bg-status-danger text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            aria-label="Send message"
            className="shrink-0 p-2 rounded-lg bg-ruby text-white hover:bg-ruby-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] text-text-muted mt-1.5 px-1">
        <span>Enter to send, Shift+Enter for newline</span>
        <span>BIS Reference Grounded</span>
      </div>
    </footer>
  );
};
