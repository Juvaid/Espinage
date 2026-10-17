import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';
import {getReelTheme} from '../../presets/themes';
import {useReelThemeFromKit} from '../../theme/KitTheme';
import type {ReelTheme} from '../../types/presets';
import ICONSET from '../../icons/phosphor.json';

// Benefit rows as toggle switches (off state stays readable: visible track, ringed knob, label at 62%): each row slides in, then on its spoken word the knob slides across the track
// (with a small stretch while it travels), the track fills with the brand metal behind it, the icon in the knob
// turns once and the label lights up. For "why us" lists of 2–4 short benefits (two-line labels in tracked caps).
// Brand-themed: accent = metal, ground = knob ink, fontFamilyLabel defaults to the theme's head face.
// built-in glyphs, or any name from the Phosphor set (src/icons/phosphor.json), e.g. 'buildings', 'currency-inr'
export type ToggleIcon = 'rupee' | 'diamond' | 'pin' | 'building' | 'key' | 'car' | 'chart' | 'shield' | keyof typeof ICONSET;
export type ToggleItem = {label: [string, string?]; icon: ToggleIcon; at: number};

const ICON: Record<string, string> = {
  // 24-unit solid glyphs, drawn in the accent inside the dark knob
  rupee: 'M6 4h12v2.4h-3.6c.5.6.9 1.4 1 2.2H18V11h-2.6c-.5 2.6-2.6 4.2-5.6 4.4L16 21h-3.4l-5.4-5.7v-2.1h2.3c1.7 0 2.9-.7 3.3-2.2H6V8.6h6.7c-.4-1.3-1.6-2.2-3.4-2.2H6z',
  diamond: 'M6.5 3h11l4 5.5L12 21 2.5 8.5zM5.4 8.5h4.2L12 16.7zm9 0h4.2L12 16.7zM10.4 8.5h3.2L12 13.8zM8 5l1.6 2.5H5.9zm8 0l2.1 2.5h-3.7zm-5.1 0h2.2l1.1 2.5h-4.4z',
  pin: 'M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7zm0 4.3a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4z',
  building: 'M4 21V7l6-3v4l6-3v16h4v2H2v-2zm4-11v2h2v-2zm0 4v2h2v-2zm4-4v2h2v-2zm0 4v2h2v-2z',
  key: 'M8 14a6 6 0 1 1 5.6-8.2L22 6v4h-2v2h-2v2h-3.6A6 6 0 0 1 8 14zm-1.5-6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
  car: 'M5 11l2-5h10l2 5h1v6h-2v2h-3v-2H9v2H6v-2H4v-6zm2.2 0h9.6l-1.2-3H8.4zM7 13.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm10 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z',
  chart: 'M3 21V3h2v16h16v2zm4-4V11h3v6zm5 0V7h3v10zm5 0v-8h3v8z',
  shield: 'M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5zm-1 13.6l6-6-1.4-1.4-4.6 4.6-2.2-2.2L7.4 12z',
};

export const TogglePills: React.FC<{
  items: ToggleItem[];
  startFrame: number;
  theme?: string | ReelTheme;
  top?: number;
  left?: number;
  rowGap?: number;
  fontFamilyLabel?: string;
}> = ({items, startFrame, theme, top = 600, left = 110, rowGap = 210, fontFamilyLabel}) => {
  const f = useCurrentFrame();
  const kit = useReelThemeFromKit();
  const t = theme === undefined ? kit : getReelTheme(theme);
  const W = 300, H = 134, K = 114; // track width/height, knob diameter
  const label = fontFamilyLabel ?? t.fontFamilyHead;
  return (
    <div style={{position: 'absolute', left, top}}>
      {items.map((it, i) => {
        const inn = ramp(f, startFrame + i * 5, 18, 0, 1, ease.out);
        const on = ramp(f, it.at - 2, 14, 0, 1, ease.inOut);
        if (inn <= 0) return null;
        // the knob stretches while it travels: widest at mid-travel
        const stretch = 1 + 0.16 * Math.sin(Math.PI * on);
        const knobX = 8 + (W - K - 16) * on;
        const pulse = ramp(f, it.at + 10, 18, 0, 1, ease.out);
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: i * rowGap, display: 'flex', alignItems: 'center', gap: 44, opacity: inn, transform: `translateX(${(1 - inn) * -70}px)`}}>
            {/* track: dark, filling with the metal behind the knob as it travels */}
            <div style={{position: 'relative', width: W, height: H, borderRadius: H / 2, background: `linear-gradient(180deg, color-mix(in oklch, ${t.ground} 70%, white 14%), color-mix(in oklch, ${t.ground} 85%, white 4%))`, boxShadow: `inset 0 2px 6px oklch(0 0 0 / 0.55), 0 0 0 2px ${t.hairline}`, overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: knobX + K / 2 + 8, borderRadius: H / 2, background: `linear-gradient(100deg, ${t.accent} 0%, color-mix(in oklch, ${t.accent} 55%, white) 45%, color-mix(in oklch, ${t.accent} 70%, black) 100%)`, opacity: 0.25 + 0.75 * on}} />
              <div style={{position: 'absolute', left: knobX, top: (H - K) / 2, width: K, height: K, borderRadius: K / 2, transform: `scaleX(${stretch})`, transformOrigin: on < 0.5 ? '0% 50%' : '100% 50%', background: `radial-gradient(circle at 35% 30%, color-mix(in oklch, ${t.ground} 60%, white 22%), ${t.ground} 75%)`, border: `1.5px solid ${t.hairline}`, boxShadow: `0 6px 16px oklch(0 0 0 / 0.55), 0 0 ${24 * pulse * (1 - pulse) * 4}px ${t.accentGlow}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {it.icon in ICON ? (
                  <svg width={58} height={58} viewBox="0 0 24 24" style={{transform: `rotate(${on * 360}deg) scaleX(${1 / stretch})`}}>
                    <path d={ICON[it.icon]} fill={t.accent} fillRule="evenodd" />
                  </svg>
                ) : (
                  <svg width={58} height={58} viewBox="0 0 256 256" style={{transform: `rotate(${on * 360}deg) scaleX(${1 / stretch})`}}>
                    {((ICONSET as unknown as Record<string, {fill?: [string, number][]}>)[it.icon]?.fill ?? []).map(([d], k) => <path key={k} d={d} fill={t.accent} />)}
                  </svg>
                )}
              </div>
            </div>
            {/* label: two lines of tracked caps, lit as the toggle lands; a hairline rule under the row */}
            <div style={{position: 'relative', fontFamily: label, fontWeight: 500, fontSize: 58, letterSpacing: '0.2em', lineHeight: 1.08, textTransform: 'uppercase', color: t.ivory, opacity: 0.62 + 0.38 * on, textShadow: on > 0.5 ? `0 0 26px ${t.accentGlow}` : undefined}}>
              <div>{it.label[0]}</div>
              {it.label[1] ? <div>{it.label[1]}</div> : null}
              <div style={{position: 'absolute', left: 0, bottom: -34, height: 1.5, width: 560 * inn, background: `linear-gradient(90deg, ${t.hairline}, transparent)`}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
