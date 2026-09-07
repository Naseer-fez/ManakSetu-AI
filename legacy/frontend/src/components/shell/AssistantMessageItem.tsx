import { type FC } from 'react';
import { CopyAction } from '@/components/primitives/CopyAction';
import { type ChatMessage } from '@/components/shell/assistant.types';
import { cn } from '@/lib/utils';

export interface AssistantMessageItemProps {
  message: ChatMessage;
}

export const AssistantMessageItem: FC<AssistantMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex flex-col gap-1 w-full', isUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'p-3.5 rounded-2xl text-xs leading-relaxed max-w-[88%] break-words',
          isUser
            ? 'bg-subtle border border-border-highlight text-text-primary rounded-tr-sm'
            : 'bg-panel/80 border border-border text-text-primary rounded-tl-sm shadow-sm'
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t border-border-subtle">
            <span className="text-[10px] text-text-muted font-medium">Standards:</span>
            {message.citations.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-subtle text-ruby border border-border"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-1 text-[10px] text-text-muted">
        {message.timestamp && <span>{message.timestamp}</span>}
        {!isUser && (
          <CopyAction
            content={message.content}
            label="Copy"
            size="sm"
            variant="ghost"
            className="h-5 px-1.5 text-[10px]"
          />
        )}
      </div>
    </div>
  );
};
