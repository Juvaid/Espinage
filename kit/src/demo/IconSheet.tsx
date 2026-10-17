import React from 'react';
import {AbsoluteFill} from 'remotion';
import '../lib/fonts';
import ICONS from '../icons/phosphor.json';
import {KitIcon, type KitIconName} from '../icons/KitIcon';
import {KitThemeProvider, useKitTheme} from '../theme/KitTheme';

// The curated icon set, grouped, with names: the reference sheet agents pick from.
const Sheet: React.FC<{weight: 'fill' | 'duotone'}> = ({weight}) => {
  const t = useKitTheme();
  const groups: Record<string, string[]> = {};
  Object.entries(ICONS as unknown as Record<string, {group: string}>).forEach(([n, r]) => (groups[r.group] ??= []).push(n));
  return (
    <AbsoluteFill style={{background: t.deep, padding: 48, color: t.ivory, fontFamily: t.fontHead}}>
      {Object.entries(groups).map(([g, names]) => (
        <div key={g} style={{marginBottom: 26}}>
          <div style={{fontFamily: t.fontLabel, fontSize: 22, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.accent, marginBottom: 10}}>{g}</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
            {names.map((n) => (
              <div key={n} style={{width: 136, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
                <KitIcon name={n as KitIconName} size={58} weight={weight} />
                <div style={{fontSize: 14, opacity: 0.75, textAlign: 'center'}}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
export const IconSheet: React.FC<{theme: string; weight: 'fill' | 'duotone'}> = ({theme, weight}) => (
  <KitThemeProvider theme={theme}>
    <Sheet weight={weight} />
  </KitThemeProvider>
);
