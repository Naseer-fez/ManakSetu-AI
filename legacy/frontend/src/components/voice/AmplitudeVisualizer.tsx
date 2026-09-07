import { type FC } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  amplitude: number;
  state: 'idle' | 'listening' | 'processing';
}

export const AmplitudeVisualizer: FC<Props> = ({ amplitude, state }) => {
  const bars = Array.from({ length: 12 });
  
  return (
    <div className="flex items-center gap-1 h-12">
      {bars.map((_, i) => {
        const height = state === 'idle' ? 4 : 4 + Math.random() * amplitude * 40;
        return (
          <div
            key={i}
            className={cn(
              "w-2 rounded-full transition-all duration-75",
              state === 'idle' ? "bg-border" : state === 'listening' ? "bg-status-compliant-bg" : "bg-ruby"
            )}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
};
