import { type FC } from 'react';
import { MotionButton } from '@/components/primitives/MotionButton';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface Props {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const GraphControls: FC<Props> = ({ zoom, onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="absolute bottom-4 right-4 flex gap-2 bg-surface p-2 rounded-xl border border-border shadow-lg">
      <MotionButton onClick={onZoomOut} className="p-2 rounded hover:bg-panel text-text-primary">
        <ZoomOut size={20} />
      </MotionButton>
      <div className="flex items-center px-2 text-text-muted text-sm font-mono">
        {Math.round(zoom * 100)}%
      </div>
      <MotionButton onClick={onZoomIn} className="p-2 rounded hover:bg-panel text-text-primary">
        <ZoomIn size={20} />
      </MotionButton>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <MotionButton onClick={onReset} className="p-2 rounded hover:bg-panel text-text-primary">
        <Maximize size={20} />
      </MotionButton>
    </div>
  );
};
