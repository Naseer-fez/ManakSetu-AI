import { useRef, useEffect, type FC } from 'react';
import { GraphData, GraphNode } from '@/types';

interface Props {
  data: GraphData | null;
  onSelectNode: (node: GraphNode) => void;
}

export const ForceGraph: FC<Props> = ({ data, onSelectNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      data.edges.forEach(edge => {
        const source = data.nodes.find(n => n.id === edge.source);
        const target = data.nodes.find(n => n.id === edge.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, canvas.height / 2); // simplified, real forces omitted for brevity
          ctx.lineTo(canvas.width / 2 + 50, canvas.height / 2 + 50);
          ctx.strokeStyle = '#333';
          ctx.stroke();
        }
      });
      
      data.nodes.forEach((node, i) => {
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + i * 20, canvas.height / 2, 10, 0, Math.PI * 2);
        ctx.fillStyle = node.is_mandatory ? '#f00' : '#00f';
        ctx.fill();
      });

      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const handleClick = () => {
      if (data.nodes.length > 0) onSelectNode(data.nodes[0]);
    };
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('click', handleClick);
    };
  }, [data, onSelectNode]);

  return <canvas ref={canvasRef} className="w-full h-full bg-canvas cursor-pointer" />;
};
