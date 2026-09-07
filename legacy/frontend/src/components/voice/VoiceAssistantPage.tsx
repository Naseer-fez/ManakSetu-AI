import { useState, type FC } from 'react';
import { AgentSphere } from '@/components/voice/AgentSphere';
import { PushToTalkButton } from '@/components/voice/PushToTalkButton';
import { VoiceTranscript } from '@/components/voice/VoiceTranscript';
import { LanguageSelector } from '@/components/voice/LanguageSelector';
import { AiModeSelector } from '@/components/primitives/AiModeSelector';
import { VoiceChatMessage } from '@/types';
import { sendVoiceChat } from '@/services/voice.service';

export const VoiceAssistantPage: FC = () => {
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [mode, setMode] = useState<'fast' | 'thinking'>('thinking');
  const [lang, setLang] = useState('auto');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecording = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const res = await sendVoiceChat(blob, { language: lang, mode });
      if (res) {
        setMessages(prev => [...prev, { role: 'user', content: 'Audio sent' }, { role: 'assistant', content: res.llm_response, document_evidences: res.document_evidences }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-canvas">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <AiModeSelector mode={mode} onModeChange={setMode} />
        <LanguageSelector value={lang} onChange={setLang} />
        <button onClick={() => setMessages([])} className="text-text-muted text-sm hover:text-text-primary">Clear</button>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <VoiceTranscript messages={messages} />
        <div className="p-4 flex flex-col items-center gap-6 bg-surface border-t border-border">
          <AgentSphere amplitude={isProcessing ? 0.8 : 0} isActive={isProcessing} />
          <PushToTalkButton onRecordingComplete={handleRecording} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  );
};
