import React from 'react';
import { AbsoluteFill, Audio, Sequence, useVideoConfig, type CalculateMetadataFunction } from 'remotion';
import '../lib/fonts';
import { asset } from '../lib/asset';
import { BevelDefs } from '../pro/Bevel';
import { KitThemeProvider } from '../theme/KitTheme';
import { ItemMotion, motionDefaults } from './motion';
import { registryByType } from './registry';
import { manifestDuration, parseManifest, type Manifest } from './schema';

// Plays a project (manifest). The same component runs in the Remotion Studio, in the Caption Studio's Player
// (inputProps = manifest) and on the VPS render box (--props=manifest.json), so the preview is the render.
// uploaded media (absolute URLs, root paths) pass through; the rest are kit assets
const src = asset;

// only the motion fields an item actually has (parsed items have all four)
const pick = (it: { enter?: unknown; exit?: unknown; transform?: unknown; animate?: unknown }) =>
  Object.fromEntries((['enter', 'exit', 'transform', 'animate'] as const).filter((k) => it[k] !== undefined).map((k) => [k, it[k]]));

const Problem: React.FC<{ title: string; lines: string[] }> = ({ title, lines }) => (
  <AbsoluteFill style={{ background: '#1a0d10', color: '#ffd5d5', padding: 60, fontFamily: 'system-ui', fontSize: 30, lineHeight: 1.4 }}>
    <div style={{ fontSize: 44, fontWeight: 700, marginBottom: 20 }}>{title}</div>
    {lines.slice(0, 12).map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </AbsoluteFill>
);

export const ManifestReel: React.FC<Record<string, unknown>> = (raw) => {
  const { fps } = useVideoConfig();
  const parsed = parseManifest(raw);
  if (!parsed.ok) return <Problem title="This project has problems" lines={parsed.problems} />;
  const m: Manifest = parsed.manifest;
  const voiceWords = m.voice?.words.map((w) => ({ ...w, start: w.start + m.voice!.offset / fps, end: w.end + m.voice!.offset / fps })) ?? [];
  return (
    <KitThemeProvider theme={m.theme}>
      <AbsoluteFill style={{ background: '#000' }}>
        <BevelDefs />
        {m.tracks.map((t) =>
          t.hidden ? null : (
            <AbsoluteFill key={t.id}>
              {t.items.map((it) => {
                const e = registryByType(it.type);
                if (!e) return null; // parseManifest already rejects unknown types
                return (
                  <Sequence key={it.id} from={it.from} durationInFrames={it.durationInFrames} name={it.label || e.label} layout="none">
                    <ItemMotion durationInFrames={it.durationInFrames} {...motionDefaults()} {...pick(it)}>
                      {e.render(it.props as never, { fps, from: it.from, durationInFrames: it.durationInFrames, voiceWords })}
                    </ItemMotion>
                  </Sequence>
                );
              })}
            </AbsoluteFill>
          ),
        )}
        {m.voice?.src ? (
          <Sequence from={m.voice.offset} name="Voiceover" layout="none">
            <Audio src={src(m.voice.src)} volume={m.voice.volume} />
          </Sequence>
        ) : null}
        {m.music?.src ? <Audio src={src(m.music.src)} volume={m.music.volume} startFrom={Math.round(m.music.startAt * fps)} name="Music" /> : null}
      </AbsoluteFill>
    </KitThemeProvider>
  );
};

/** Composition metadata from the manifest itself (size, fps, length), so any project renders at its own settings. */
export const manifestMetadata: CalculateMetadataFunction<Record<string, unknown>> = ({ props }) => {
  const parsed = parseManifest(props);
  if (!parsed.ok) return { durationInFrames: 90, fps: 30, width: 1080, height: 1920 };
  const m = parsed.manifest;
  return { durationInFrames: manifestDuration(m), fps: m.fps, width: m.width, height: m.height };
};
