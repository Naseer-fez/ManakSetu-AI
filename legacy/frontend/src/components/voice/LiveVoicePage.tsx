import { type FC } from 'react';
import { MotionButton } from '@/components/primitives/MotionButton';
import { AmplitudeVisualizer } from '@/components/voice/AmplitudeVisualizer';
import { LiveTranscriptStream } from '@/components/voice/LiveTranscriptStream';
import { useLiveVoice } from '@/hooks/useLiveVoice';

export const LiveVoicePage: FC = () => {
  const { isConnected, status, turns, currentTranscript: interimText, connect, disconnect, setStatus, error } = useLiveVoice();
  const isListening = status === 'listening';
  const startListening = () => setStatus('listening');
  const stopListening = () => setStatus('idle');

  return (
    <div className="flex flex-col h-full bg-canvas">
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-status-compliant-bg' : 'bg-status-danger-bg'}`} />
          <span className="text-text-primary text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex gap-2">
          {!isConnected ? (
            <MotionButton onClick={connect} className="bg-panel border border-border text-text-primary px-4 py-2 rounded-md">Connect</MotionButton>
          ) : (
            <MotionButton onClick={disconnect} className="bg-ruby-subtle border border-ruby text-ruby px-4 py-2 rounded-md">Disconnect</MotionButton>
          )}
        </div>
      </div>
      
      <LiveTranscriptStream interim={interimText} turns={turns} />
      
      {error && <div className="p-2 text-status-danger text-sm bg-status-danger-bg mx-4 rounded">{error}</div>}
      
      <div className="p-4 bg-surface border-t border-border flex flex-col items-center gap-4">
        <AmplitudeVisualizer amplitude={isListening ? 0.8 : 0} state={isConnected ? (isListening ? 'listening' : 'idle') : 'idle'} />
        <MotionButton
          onClick={isListening ? stopListening : startListening}
          disabled={!isConnected}
          className="bg-panel border border-border text-text-primary px-6 py-2 rounded-full"
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </MotionButton>
      </div>
    </div>
  );
};
