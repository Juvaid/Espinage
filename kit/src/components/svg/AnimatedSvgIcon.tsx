import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';

import {IconName} from '../../types/graphics';

const PATHS: Record<IconName, string[]> = {
  design: [
    'M8 40 L40 40',
    'M24 8 L14 38',
    'M24 8 L34 38',
    'M17.5 28 L30.5 28',
    'M24 8 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0',
  ],
  pantry: [
    'M11 20 L33 20 L31 38 Q30.5 41 27.5 41 L16.5 41 Q13.5 41 13 38 Z',
    'M33 24 Q40 24 40 29 Q40 34 32 34',
    'M18 9 Q15 12 18 15',
    'M23 7 Q20 11 23 15',
    'M28 9 Q25 12 28 15',
  ],
  restroom: [
    'M13 42 L13 7 L35 7 L35 42',
    'M9 42 L39 42',
    'M29 25 L29 27',
    'M13 7 L27 11 L27 44',
  ],
  parking: [
    'M10 6 L38 6 Q42 6 42 10 L42 38 Q42 42 38 42 L10 42 Q6 42 6 38 L6 10 Q6 6 10 6 Z',
    'M19 34 L19 14 L27 14 Q33 14 33 20 Q33 26 27 26 L19 26',
  ],
  area: [
    'M8 14 L40 14 L40 40 L8 40 Z',
    'M8 8 L40 8',
    'M8 5 L8 11',
    'M40 5 L40 11',
    'M22 14 L22 26 L40 26',
  ],
  kitchen: [
    'M8 24 L40 24 L37 40 Q36.5 42 34 42 L14 42 Q11.5 42 11 40 Z',
    'M5 24 L43 24',
    'M18 24 Q24 17 30 24',
    'M19 13 Q16 16 19 19',
    'M29 13 Q26 16 29 19',
  ],
  alfresco: [
    'M6 20 Q24 4 42 20 Z',
    'M24 20 L24 42',
    'M14 32 L34 32',
    'M17 32 L15 42',
    'M31 32 L33 42',
  ],
  sky: [
    'M6 36 L42 36',
    'M14 36 A10 10 0 0 1 34 36',
    'M24 16 L24 11',
    'M11 22 L7.5 18.5',
    'M37 22 L40.5 18.5',
    'M12 42 L36 42',
  ],
  chat: [
    'M6 10 L30 10 Q33 10 33 13 L33 25 Q33 28 30 28 L15 28 L9 33 L9 28 L9 28 Q6 28 6 25 L6 13 Q6 10 9 10',
    'M37 18 Q42 18 42 21 L42 32 Q42 35 39 35 L37 35 L37 40 L31 35 L22 35 Q19 35 19 32 L19 31',
  ],
  shield: [
    'M24 6 L38 12 L38 24 C38 34 24 42 24 42 C24 42 10 34 10 24 L10 12 Z',
    'M24 16 L24 30',
    'M18 22 L30 22',
  ],
  lift: [
    'M8 8 L40 8 L40 40 L8 40 Z',
    'M24 8 L24 40',
    'M16 22 L16 14 L12 18',
    'M32 26 L32 34 L36 30',
  ],
  star: [
    'M24 6 L29 18 L42 19 L32 28 L35 41 L24 34 L13 41 L16 28 L6 19 L19 18 Z',
  ],
};

export interface AnimatedSvgIconProps {
  name: IconName;
  startFrame: number;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
  glow?: boolean;
  style?: React.CSSProperties;
}

/** 2D Animated SVG Line Icon that draws stroke-by-stroke on the beat */
export const AnimatedSvgIcon: React.FC<AnimatedSvgIconProps> = ({
  name,
  startFrame,
  size = 48,
  strokeColor = '#DFB25A',
  strokeWidth = 2.2,
  glow = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const paths = PATHS[name] || PATHS.star;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{
        overflow: 'visible',
        filter: glow ? `drop-shadow(0 0 8px ${strokeColor})` : undefined,
        ...style,
      }}
    >
      {paths.map((d, i) => {
        const p = ramp(frame, startFrame + i * 2, 10, 0, 1, ease.inOut);
        return (
          <path
            key={i}
            d={d}
            pathLength={1}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - p}
          />
        );
      })}
    </svg>
  );
};
