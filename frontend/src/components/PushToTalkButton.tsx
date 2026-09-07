import React, { useRef, useState } from "react";
import { Mic, Loader2, Square } from "lucide-react";

interface PushToTalkButtonProps {
  onAudioReady: (blob: Blob) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export const PushToTalkButton: React.FC<PushToTalkButtonProps> = ({
  onAudioReady,
  isProcessing,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    if (isRecording || isProcessing || disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length > 0) onAudioReady(blob);
      };
      rec.start();
      setIsRecording(true);
    } catch (err: unknown) {
      setIsRecording(false);
    }
  };

  const stop = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <div className="relative flex items-center justify-center">
        {isRecording && (
          <>
            <span className="absolute w-28 h-28 rounded-full bg-red-500/20 animate-ping" />
            <span className="absolute w-24 h-24 rounded-full bg-red-500/30 animate-pulse" />
          </>
        )}
        <button
          type="button"
          onPointerDown={start}
          onPointerUp={stop}
          onClick={() => { if (!isRecording && !isProcessing) start(); else if (isRecording) stop(); }}
          disabled={disabled || isProcessing}
          aria-label={isRecording ? "Stop Recording" : "Push to talk"}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl select-none ${
            isProcessing
              ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-white/10"
              : isRecording
              ? "bg-gradient-to-tr from-red-600 to-rose-500 text-white scale-110 shadow-red-500/40 ring-4 ring-red-400/50"
              : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-blue-500/30 active:scale-95"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-9 h-9" />
          )}
        </button>
      </div>
      <p className="text-xs text-slate-400 font-medium tracking-wide">
        {isProcessing
          ? "Processing voice & reasoning with AI..."
          : isRecording
          ? "Listening... Release or tap to send"
          : "Hold or click to speak your query"}
      </p>
    </div>
  );
};
