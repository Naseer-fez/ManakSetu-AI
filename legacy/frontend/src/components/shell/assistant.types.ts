import { type AiMode } from '@/components/primitives/AiModeSelector';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp?: string;
}

export interface AssistantSheetProps {
  isOpen: boolean;
  onClose: () => void;
  documentContext?: string | null;
  onRefreshContext?: () => void;
  initialMode?: AiMode;
  className?: string;
}
