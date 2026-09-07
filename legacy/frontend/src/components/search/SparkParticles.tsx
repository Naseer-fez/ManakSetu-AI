import { type FC, type CSSProperties } from 'react';

export interface SparkParticlesProps {
  showRightBeam: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  delay: number;
}

const particles: Particle[] = [
  { x: -48, y: -35, size: 2, delay: 0.1 },
  { x: -90, y: -15, size: 1.5, delay: 0.5 },
  { x: -127, y: 22, size: 2, delay: 0.9 },
  { x: -68, y: 41, size: 1.5, delay: 1.3 },
  { x: -170, y: -30, size: 1, delay: 0.25 },
  { x: -210, y: 13, size: 1.5, delay: 0.7 },
  { x: -36, y: 20, size: 2, delay: 1.15 },
  { x: -145, y: -3, size: 1, delay: 1.55 },
  { x: 28, y: -26, size: 1.5, delay: 0.8 },
  { x: 45, y: 18, size: 1, delay: 1.4 },
  { x: -235, y: -10, size: 1, delay: 1.8 },
  { x: -105, y: 49, size: 1, delay: 0.35 },
];

export const SparkParticles: FC<SparkParticlesProps> = ({ showRightBeam }) => {
  const visible = showRightBeam ? particles : particles.filter((p) => p.x <= 0);

  return (
    <>
      {visible.map((p, index) => {
        const style = {
          '--x': `${p.x}px`,
          '--y': `${p.y}px`,
          '--size': `${p.size}px`,
          '--delay': `${p.delay}s`,
        } as CSSProperties;

        return <i key={`${p.x}-${p.y}-${index}`} className="kr-spark" style={style} />;
      })}
    </>
  );
};
