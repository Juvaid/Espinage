import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {ease, ramp} from '../lib/anim';
import {alpha, useKitTheme} from '../theme/KitTheme';

// Logo reveal (production, Dhunna reels' GoldLogo), themed: the brand's wordmark rebuilt in its metal from a white
// master with alpha. A saber edge traces the letters, the metal face fills in behind it, then one sheen crosses.
// logo: public path to the white-on-transparent master; ratio = height / width. Needs <BevelDefs /> in the film.
// mode 'mask' (default): repaint a white master in the brand metal. 'image': a full-colour mark (medallion,
// photo logo) is revealed as it is: a light wipe, the edge trace, a sheen, with no repaint.
export const LogoReveal: React.FC<{logo: string; ratio: number; start: number; width: number; mode?: 'mask' | 'image'; style?: React.CSSProperties}> = ({logo, ratio, start, width, mode = 'mask', style}) => {
  const frame = useCurrentFrame();
  const C = useKitTheme();
  const SRC = logo;
  const url = `url(${staticFile(SRC)})`;
  const h = width * ratio;

  const saber = ramp(frame, start, 14, -6, 106, ease.inOut); // head position, %
  const fill = ramp(frame, start + 3, 14, 0, 100, ease.inOut);
  const sheen = ramp(frame, start + 20, 18, -20, 120, ease.inOut);
  const rim = frame < start + 17 ? 0.9 : ramp(frame, start + 17, 14, 0.9, 0.22);
  const breathe = 0.85 + Math.sin((frame - start) / 16) * 0.15;
  const drift = (frame - start) * 0.15; // slow push after reveal

  const masked = (extra: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    ...extra,
  });

  // Metal: bright top edge, deep middle, warm bounce. INFRA (lower third) reads champagne.
  const metal = `linear-gradient(180deg, ${C.type3d.ramp.map(([o, c]) => `${c} ${Math.round(o * 100)}%`).join(', ')})`;
  const extrude = [0.25, 0.4, 0.55, 0.7].map((k) => `color-mix(in oklch, ${C.type3d.side} ${Math.round(k * 100)}%, black)`);

  if (mode === 'image') {
    return (
      <div style={{position: 'relative', width, height: h, transform: `scale(${0.96 + 0.04 * (fill / 100) + drift * 0.0006})`, ...style}}>
        <Img src={staticFile(SRC)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', clipPath: `inset(-5% ${100 - fill}% -5% 0)`, filter: `drop-shadow(0 0 24px ${alpha(C.glow, 0.5)})`}} />
        <div style={masked({background: `linear-gradient(112deg, transparent ${sheen - 14}%, rgba(255,250,240,0.2) ${sheen - 5}%, rgba(255,252,246,0.85) ${sheen}%, rgba(255,250,240,0.2) ${sheen + 5}%, transparent ${sheen + 14}%)`, mixBlendMode: 'screen'})} />
        {saber > 0 && saber < 100 ? (
          <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `linear-gradient(90deg, transparent ${saber - 6}%, black ${saber}%, transparent ${saber + 1}%)`, maskImage: `linear-gradient(90deg, transparent ${saber - 6}%, black ${saber}%, transparent ${saber + 1}%)`, filter: `drop-shadow(0 0 10px ${C.type3d.ramp[0][1]}) drop-shadow(0 0 28px ${C.accent})`}}>
            <Img src={staticFile(SRC)} style={{width: '100%', height: '100%', filter: 'brightness(1.6)'}} />
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div style={{position: 'relative', width, height: h, transform: `scale(${1 + drift * 0.0006})`, ...style}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="logo-edge" x="-5%" y="-10%" width="110%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={1.6} result="d" />
          <feComposite in="d" in2="SourceAlpha" operator="out" result="edge" />
          <feFlood floodColor={C.type3d.ramp[0][1]} />
          <feComposite in2="edge" operator="in" />
        </filter>
      </svg>

      {/* Extrusion: a few px of darker gold beneath the face. */}
      {[4, 3, 2, 1].map((d) => (
        <div
          key={d}
          style={masked({
            background: extrude[4 - d],
            transform: `translateY(${d}px)`,
            clipPath: `inset(-5% ${100 - fill}% -5% 0)`,
          })}
        />
      ))}

      {/* Face */}
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(-5% ${100 - fill}% -5% 0)`, filter: `url(#bevel-sm-${C.metal})`}}>
        <div style={masked({background: metal})} />
      </div>

      {/* Sheen */}
      <div
        style={masked({
          background: `linear-gradient(112deg, transparent ${sheen - 14}%, rgba(255,250,235,0.25) ${sheen - 5}%, rgba(255,252,242,0.95) ${sheen}%, rgba(255,250,235,0.25) ${sheen + 5}%, transparent ${sheen + 14}%)`,
          mixBlendMode: 'screen',
        })}
      />

      {/* Saber edge: traced outline, hot at the head, settling into a faint rim. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(-10% ${Math.max(0, 100 - saber)}% -10% 0)`,
          opacity: rim * breathe,
          filter: `drop-shadow(0 0 6px ${C.accent}) drop-shadow(0 0 18px ${alpha(C.glow, 0.7)})`,
        }}
      >
        <Img src={staticFile(SRC)} style={{width: '100%', height: '100%', filter: 'url(#logo-edge)'}} />
      </div>
      {saber > 0 && saber < 100 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: `linear-gradient(90deg, transparent ${saber - 6}%, black ${saber}%, transparent ${saber + 1}%)`,
            maskImage: `linear-gradient(90deg, transparent ${saber - 6}%, black ${saber}%, transparent ${saber + 1}%)`,
            filter: `drop-shadow(0 0 10px ${C.type3d.ramp[0][1]}) drop-shadow(0 0 28px ${C.accent})`,
          }}
        >
          <Img src={staticFile(SRC)} style={{width: '100%', height: '100%', filter: 'url(#logo-edge) brightness(1.4)'}} />
        </div>
      ) : null}
    </div>
  );
};
