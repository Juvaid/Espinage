/** Production color and shadow utilities */

export const TEXT_SHADOW_DEEP = '0 2px 18px oklch(0.06 0.006 70 / 0.75), 0 1px 3px oklch(0.06 0.006 70 / 0.6)';
export const TEXT_SHADOW_SUBTLE = '0 2px 8px rgba(0, 0, 0, 0.5)';
export const TEXT_SHADOW_POP = '0 4px 0 #000, 0 8px 20px rgba(0,0,0,0.8)';

/** Interpolate between two 6-digit hex colors */
export const mixHex = (hexA: string, hexB: string, t: number): string => {
  const parse = (h: string) => {
    const clean = h.replace('#', '');
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
};

export const standardGlow = (accentColor: string, radius = 24, alpha = 0.45) =>
  `0 0 ${radius}px ${accentColor}`;
