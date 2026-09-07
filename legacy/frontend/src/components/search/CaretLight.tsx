import { type FC } from 'react';
import { SparkParticles } from '@/components/search/SparkParticles';

export interface CaretLightProps {
  showRightBeam?: boolean;
}

export const CaretLight: FC<CaretLightProps> = ({ showRightBeam = false }) => {
  return (
    <span className="kr-caret-anchor" aria-hidden="true">
      <span className="kr-ray-back" data-visible={showRightBeam} />
      <span className="kr-left-light">
        <span className="kr-ray-wide" />
        <span className="kr-ray-core" />
        <span className="kr-caret-bloom" />
      </span>
      <SparkParticles showRightBeam={showRightBeam} />
      <span className="kr-caret" />
    </span>
  );
};
