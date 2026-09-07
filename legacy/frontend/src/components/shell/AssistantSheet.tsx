import { useState, useRef, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AssistantHeader } from '@/components/shell/AssistantHeader';
import { AssistantMessageItem } from '@/components/shell/AssistantMessageItem';
import { AssistantComposer } from '@/components/shell/AssistantComposer';
import { type AiMode } from '@/components/primitives/AiModeSelector';
import { type AssistantSheetProps, type ChatMessage } from '@/components/shell/assistant.types';
import { cn } from '@/lib/utils';

export type { AssistantSheetProps, ChatMessage };

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init-1',
    role: 'assistant',
    content: 'Welcome to the BIS Procurement Assistant. Grounded in official Indian Standards (IS), mandatory QCOs, and GeM guidelines. How can I assist with your tender specifications?',
    citations: ['IS 16221', 'QCO 2020'],
    timestamp: 'Just now',
  },
];

export const AssistantSheet: FC<AssistantSheetProps> = ({
  isOpen,
  onClose,
  documentContext,
  onRefreshContext,
  initialMode = 'fast',
  className,
}) => {
  const [mode, setMode] = useState<AiMode>(initialMode);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages]);

  const handleSendMessage = (text: string): void => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const replyMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      content: mode === 'thinking'
        ? `[Thinking Mode Analysis]\nReviewing normative dependencies for "${text}".\nMandatory compliance under BIS Act 2016 requires conforming to applicable QCO schedules.`
        : `Under Indian Standards guidelines for "${text}", tenderers must furnish valid BIS CRS/ISI certification.`,
      citations: ['IS 732:2019', 'IS 694'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, replyMsg]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={cn(
            'fixed top-0 right-0 bottom-0 z-30 w-full sm:w-[380px] flex flex-col',
            'bg-surface/95 backdrop-blur-xl border-l border-border shadow-2xl',
            className
          )}
          aria-label="BIS Assistant Side Sheet"
        >
          <AssistantHeader
            mode={mode}
            onModeChange={setMode}
            documentContext={documentContext}
            onRefreshContext={onRefreshContext}
            onClose={onClose}
          />

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <AssistantMessageItem key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <AssistantComposer onSendMessage={handleSendMessage} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
