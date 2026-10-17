import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import {useKitTheme, type KitTheme} from '../theme/KitTheme';

// Type-only beats in real 3D space (production: Crown Crest v2d, Dhunna 54D). Extruded lettering (outlines from
// scripts/glyphs3d.py, overlaps removed), the hero word in the brand metal with a smooth animated ramp, light words
// in satin; each letter flies forward on its spoken word; the camera dollies in; dust and small metal objects float
// at many depths; a soft glow sits behind. The theme (colours) and glyph set are props because React context does
// not reach inside the 3D canvas: <TypeSpace font={glyphs} … /> reads the theme outside and passes it down.
export type Glyphs = {upm: number; width: number; glyphs: {ch: string; d: string; x: number}[]};
export type GlyphSet = Record<string, Glyphs>; // keys "word:weight" (scripts/glyphs3d.py)
export type Word = {text: string; weight: 300 | 640; gold?: boolean; at: number};
type Pal = KitTheme['type3d'];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// a studio for the metal to reflect: dark floor, a bright horizon band, two softboxes
const useEnv = (pal: Pal) => {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const [top, band, hot, below, floor] = pal.env;
    const t = canvasTex(1024, 512, (g) => {
      const r = g.createLinearGradient(0, 0, 0, 512);
      r.addColorStop(0, top); r.addColorStop(0.38, band); r.addColorStop(0.47, hot); r.addColorStop(0.53, below); r.addColorStop(1, floor);
      g.fillStyle = r; g.fillRect(0, 0, 1024, 512);
      g.fillStyle = pal.box; g.fillRect(160, 110, 110, 150); g.fillRect(690, 80, 150, 70);
    });
    t.mapping = THREE.EquirectangularReflectionMapping;
    return new THREE.PMREMGenerator(gl).fromEquirectangular(t).texture;
  }, [gl, pal]);
};

// the faces carry the metal ramp themselves (a flat face reflects only one direction); bevels stay mirror metal
const useMaterials = (env: THREE.Texture, pal: Pal, glyphH: number) =>
  useMemo(() => {
    const ramp = canvasTex(4, 512, (g) => {
      const r = g.createLinearGradient(0, 0, 0, 512);
      pal.ramp.forEach(([o, c]) => r.addColorStop(o, c)); // every transition wide, no hard dark line
      g.fillStyle = r; g.fillRect(0, 0, 4, 512);
    });
    ramp.wrapS = ramp.wrapT = THREE.ClampToEdgeWrapping;
    ramp.repeat.set(1 / 4000, 1 / glyphH);
    const metal = [
      new THREE.MeshPhysicalMaterial({color: '#ffffff', map: ramp, emissiveMap: ramp, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.5, metalness: 0.55, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.04, envMap: env, envMapIntensity: 0.9}),
      new THREE.MeshPhysicalMaterial({color: pal.side, metalness: 1, roughness: 0.1, clearcoat: 1, envMap: env, envMapIntensity: 1.6}),
    ];
    const satin = [
      new THREE.MeshStandardMaterial({color: pal.satin, roughness: 0.42, metalness: 0.05, emissive: new THREE.Color(pal.satin), emissiveIntensity: 0.28, envMap: env, envMapIntensity: 0.5}),
      new THREE.MeshStandardMaterial({color: pal.side, roughness: 0.5, metalness: 0.1, envMap: env, envMapIntensity: 0.6}),
    ];
    return {metal, satin, ramp};
  }, [env, pal, glyphH]);

const glyphGeo = (d: string) => {
  const path = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`).paths[0];
  const g = new THREE.ExtrudeGeometry(SVGLoader.createShapes(path), {depth: 150, bevelEnabled: true, bevelThickness: 22, bevelSize: 12, bevelSegments: 5, curveSegments: 10});
  g.computeBoundingBox();
  return g;
};

// lay the lines out in world units: display words share one scale, light words `light` of it; lines stack down
const layout = (font: GlyphSet, lines: Word[][], maxW: number, light = 0.6) => {
  const g = (w: Word) => {
    const k = `${w.text}:${w.weight}`;
    if (!font[k]) throw new Error(`TypeSpace: no glyphs for "${k}" — run scripts/glyphs3d.py "${k}" …`);
    return font[k];
  };
  const sz = (w: Word) => (w.weight === 300 ? light : 1);
  const gap = 260;
  const widthU = (line: Word[]) => line.reduce((a, w) => a + g(w).width * sz(w), 0) + gap * (line.length - 1);
  const s = maxW / Math.max(...lines.map(widthU));
  const lh = 1000 * s;
  let y = 0;
  const placed: {w: Word; x: number; y: number; scale: number; glyphs: Glyphs}[] = [];
  lines.forEach((line) => {
    const big = Math.max(...line.map(sz));
    let x = (-widthU(line) * s) / 2;
    y -= lh * big * 0.86;
    line.forEach((w) => {
      placed.push({w, x, y, scale: s * sz(w), glyphs: g(w)});
      x += (g(w).width * sz(w) + gap) * s;
    });
    y -= lh * big * 0.22;
  });
  return {placed, height: -y};
};

export const Letters: React.FC<{font: GlyphSet; lines: Word[][]; f: number; maxW: number; light: number; pal: Pal}> = ({font, lines, f, maxW, light, pal}) => {
  const env = useEnv(pal);
  const mats = useMaterials(env, pal, 720);
  // a band of light travels up through the metal, then a second, fainter pass
  mats.ramp.offset.y = interpolate(f, [0, 40, 41, 120], [-0.55, 0.45, -0.6, 0.35], clamp);
  const {placed, height} = useMemo(() => layout(font, lines, maxW, light), [font, lines, maxW, light]);
  const geos = useMemo(() => placed.map(({glyphs}) => glyphs.glyphs.map((g) => ({g, geo: glyphGeo(g.d)}))), [placed]);
  return (
    <group position={[0, height / 2, 0]}>
      {placed.map(({w, x, y, scale}, wi) =>
        geos[wi].map(({g, geo}, li) => {
          const st = w.at + li * 1.3;
          const p = interpolate(f, [st - 6, st + 16], [0, 1], {...clamp, easing: outExpo});
          if (p <= 0) return null;
          const bb = geo.boundingBox!;
          const cx = (bb.min.x + bb.max.x) / 2;
          return (
            <group key={`${wi}-${li}`} position={[x + (g.x + cx) * scale, y + (1 - p) * -0.25, (1 - p) * -7]} rotation={[(1 - p) * -0.7, (1 - p) * 0.25, 0]} scale={[scale, scale, scale * 1.1]}>
              <mesh geometry={geo} material={w.gold ? mats.metal : mats.satin} position={[-cx, 0, -75]} />
            </group>
          );
        }),
      )}
    </group>
  );
};

// dust at many depths: soft round points, drifting up slowly
export const Dust: React.FC<{f: number; pal: Pal}> = ({f, pal}) => {
  const {geo, tex} = useMemo(() => {
    const n = 220, pts: number[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) pts.push((rnd() - 0.5) * 12, (rnd() - 0.4) * 7, -16 + rnd() * 24);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const t = canvasTex(64, 64, (c) => {
      const r = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, `rgba(${pal.dust},1)`); r.addColorStop(0.35, `rgba(${pal.dust},0.45)`); r.addColorStop(1, `rgba(${pal.dust},0)`);
      c.fillStyle = r; c.fillRect(0, 0, 64, 64);
    });
    return {geo: g, tex: t};
  }, [pal]);
  return (
    <points geometry={geo} position={[Math.sin(f / 90) * 0.15, f * 0.0035, 0]}>
      <pointsMaterial map={tex} size={0.09} sizeAttenuation transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// small metal objects (spheres, thin rings, cut stones) at many depths, kept to the sides of the words
export const Bits: React.FC<{f: number; pal: Pal}> = ({f, pal}) => {
  const env = useEnv(pal);
  const items = useMemo(() => {
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({length: 16}, (_, i) => {
      const side = i % 2 ? 1 : -1;
      const x = side * (2.2 + rnd() * 2.2), y = (rnd() - 0.5) * 6, z = -9 + rnd() * 12;
      return {kind: i % 3, x, y, z, r: 0.06 + rnd() * 0.12, spin: (rnd() - 0.5) * 0.04, ph: rnd() * 6.28};
    });
  }, []);
  const metal = useMemo(() => new THREE.MeshPhysicalMaterial({color: pal.side, metalness: 1, roughness: 0.16, clearcoat: 1, envMap: env, envMapIntensity: 1.5}), [env, pal]);
  return (
    <>
      {items.map((b, i) => (
        <mesh key={i} material={metal} position={[b.x, b.y + Math.sin(f / 40 + b.ph) * 0.12 + f * 0.002, b.z]} rotation={[f * b.spin + b.ph, f * b.spin * 1.3, 0]} scale={b.r}>
          {b.kind === 0 ? <sphereGeometry args={[1, 32, 32]} /> : b.kind === 1 ? <torusGeometry args={[1, 0.12, 16, 64]} /> : <octahedronGeometry args={[1, 0]} />}
        </mesh>
      ))}
    </>
  );
};

const Rig: React.FC<{f: number; dur: number}> = ({f, dur}) => {
  const camera = useThree((s) => s.camera);
  const u = interpolate(f, [0, dur], [0, 1], clamp);
  const e = 0.6 * u + 0.4 * (0.5 - 0.5 * Math.cos(Math.PI * u));
  const a = interpolate(e, [0, 1], [-0.07, 0.07]);
  const dist = interpolate(e, [0, 1], [17.5, 13.8]);
  camera.position.set(Math.sin(a) * dist, interpolate(e, [0, 1], [0.5, 0.25]), Math.cos(a) * dist);
  camera.lookAt(0, 0, 0);
  return null;
};

const Ready: React.FC = () => {
  const advance = useThree((s) => s.advance);
  const [h] = useState(() => delayRender('type space'));
  useEffect(() => {
    advance(performance.now());
    continueRender(h);
  }, [advance, h]);
  return null;
};

// font: glyph set from scripts/glyphs3d.py; maxW: widest line in scene units (3.15 for two-word lines, up to ~3.9);
// light: light-word size against the hero (0.6; ~0.4 when a long light line would outweigh a one-word hero)
export const TypeSpace: React.FC<{font: GlyphSet; lines: Word[][]; dur: number; maxW?: number; light?: number}> = ({font, lines, dur, maxW = 3.15, light = 0.6}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const pal = useKitTheme().type3d;
  const glow = useMemo(
    () =>
      canvasTex(256, 256, (c) => {
        const r = c.createRadialGradient(128, 128, 0, 128, 128, 128);
        r.addColorStop(0, `rgba(${pal.glow},0.5)`); r.addColorStop(0.5, `rgba(${pal.glow},0.18)`); r.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = r; c.fillRect(0, 0, 256, 256);
      }),
    [pal],
  );
  return (
    <AbsoluteFill style={{background: pal.bg}}>
      <ThreeCanvas width={width} height={height} camera={{fov: 30, near: 0.1, far: 200}} gl={{antialias: true}}>
        <color attach="background" args={[pal.bg]} />
        <fog attach="fog" args={[pal.bg, 16, 34]} />
        <Rig f={f} dur={dur} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[-4, 6, 8]} intensity={1.6} color="#ffffff" />
        <directionalLight position={[3, 2, -6]} intensity={1.2} color={pal.light} />
        <sprite position={[0, 0.2, -5]} scale={[16, 10, 1]}>
          <spriteMaterial map={glow} transparent depthWrite={false} opacity={interpolate(f, [0, 20], [0, 1], clamp)} />
        </sprite>
        {lines.length ? <Letters font={font} lines={lines} f={f} maxW={maxW} light={light} pal={pal} /> : null}
        <Bits f={f} pal={pal} />
        <Dust f={f} pal={pal} />
        <Ready />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// the same space with no words: a ground for card beats, so cards float in the world the type lives in
export const Space: React.FC<{dur: number}> = ({dur}) => <TypeSpace font={{}} lines={[]} dur={dur} />;
