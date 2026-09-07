import { type FC, useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { MotionButton } from '@/components/primitives/MotionButton';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-panel border-t border-border">
      <div className="flex items-end gap-2 max-w-4xl mx-auto relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about BIS standards..."
          rows={1}
          className="flex-1 max-h-32 min-h-[44px] bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-ruby outline-none resize-none"
        />
        <MotionButton
          variant="ruby"
          size="icon"
          onClick={handleSend}
          isLoading={isLoading}
          className="shrink-0 mb-1"
        >
          <Send className="w-4 h-4" />
        </MotionButton>
      </div>
    </div>
  );
};
