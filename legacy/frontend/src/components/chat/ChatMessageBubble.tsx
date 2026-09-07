import { type FC } from 'react';
import { cn } from '@/lib/utils';
import { CopyAction } from '@/components/primitives/CopyAction';

export interface ChatBubbleMessage {
  role: string;
  content: string;
  timestamp?: string;
}

interface ChatMessageBubbleProps {
  message: ChatBubbleMessage;
}

export const ChatMessageBubble: FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex w-full mb-6', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl p-4',
          isUser 
            ? 'bg-ruby-subtle text-ruby border border-ruby/20 rounded-br-sm'
            : 'bg-panel text-text-primary border border-border rounded-bl-sm'
        )}
      >
        <div className="flex justify-between items-start gap-4 mb-1">
          <span className="text-xs font-semibold opacity-70">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {!isUser && <CopyAction content={message.content} />}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        {message.timestamp && (
          <div className="text-[10px] text-right mt-2 opacity-50">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

