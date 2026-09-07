import { useRef, useEffect, type FC } from 'react';


interface Props {
  amplitude: number;
  isActive: boolean;
}

export const AgentSphere: FC<Props> = ({ amplitude, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 50 + amplitude * 20, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? 'rgba(255, 100, 100, 0.8)' : 'rgba(100, 100, 100, 0.8)';
      ctx.fill();
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frame);
  }, [amplitude, isActive]);

  return <canvas ref={canvasRef} width={200} height={200} className="rounded-full" />;
};
