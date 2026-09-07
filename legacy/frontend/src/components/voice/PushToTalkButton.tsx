import { type FC } from 'react';
import { MotionButton } from '@/components/primitives/MotionButton';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

export const PushToTalkButton: FC<Props> = ({ onRecordingComplete, isProcessing }) => {
  const { isRecording, startRecording, stopRecording, error } = useAudioRecorder();

  const handlePointerDown = () => startRecording();
  const handlePointerUp = async () => { const blob = await stopRecording(); if (blob) onRecordingComplete(blob); };

  return (
    <div className="flex flex-col items-center">
      <MotionButton
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        disabled={isProcessing}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center transition-colors",
          isRecording ? "bg-ruby-glow text-ruby border-ruby" : "bg-surface border-border",
          isProcessing && "opacity-50"
        )}
        aria-label="Push to talk"
      >
        <Mic className={isRecording ? "w-10 h-10 animate-pulse" : "w-10 h-10"} />
      </MotionButton>
      {error && <span className="text-status-danger text-sm mt-2">{error}</span>}
    </div>
  );
};
