import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {StudioEnv} from './StudioEnv';

// Money overlay for lines about investing ("paisa lagana"): a short rain of gold ₹ coins tumbling through the
// frame at several depths, then gone. Coin = metal rim + embossed ₹ face (ported from dhunnainfra-reelv3
// src/three/Coins.tsx). Transparent canvas, laid over whatever the beat shows; use only where money is spoken.
const faceTexture = () => {
  const s = 512;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(s * 0.4, s * 0.35, s * 0.05, s / 2, s / 2, s / 2);
  grad.addColorStop(0, '#ffe7a6'); grad.addColorStop(0.55, '#dcaa4e'); grad.addColorStop(1, '#9c7128');
  g.fillStyle = grad; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(90,60,15,0.55)'; g.lineWidth = 10;
  g.beginPath(); g.arc(s / 2, s / 2, s * 0.4, 0, Math.PI * 2); g.stroke();
  g.font = `600 ${s * 0.5}px Geist, "Noto Sans", sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(80,52,12,0.8)'; g.fillText('₹', s / 2 + 5, s / 2 + 12);
  g.fillStyle = 'rgba(255,245,215,0.9)'; g.fillText('₹', s / 2 - 4, s / 2 + 2);
  g.fillStyle = '#c9953c'; g.fillText('₹', s / 2, s / 2 + 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const Coins: React.FC<{f: number; dur: number; n: number}> = ({f, dur, n}) => {
  const {geo, mats, coins} = useMemo(() => {
    const face = new THREE.MeshPhysicalMaterial({map: faceTexture(), metalness: 0.75, roughness: 0.3, clearcoat: 0.4});
    const rim = new THREE.MeshPhysicalMaterial({color: '#dcaa4e', metalness: 0.9, roughness: 0.24, clearcoat: 0.35});
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    // each coin: lane across the frame, depth, start delay, spin axis and rate
    const coins = Array.from({length: n}, () => ({x: (rnd() - 0.5) * 7, z: -4 + rnd() * 7, delay: rnd() * 14, spin: [rnd() * 0.25, rnd() * 0.2, rnd() * 0.15], ph: rnd() * 6.28, s: 0.7 + rnd() * 0.6}));
    return {geo: new THREE.CylinderGeometry(0.5, 0.5, 0.09, 72), mats: [rim, face, face], coins};
  }, [n]);
  return (
    <>
      {coins.map((c, i) => {
        const t = Math.max(0, f - c.delay);
        if (t <= 0) return null;
        // fall with gravity from above the frame, a gentle sideways drift
        const y = 6 - 0.0042 * t * t * 1.6 - t * 0.05;
        if (y < -7) return null;
        return <mesh key={i} geometry={geo} material={mats} position={[c.x + Math.sin(t / 20 + c.ph) * 0.3, y, c.z]} rotation={[c.ph + t * c.spin[0], t * c.spin[1], c.ph + t * c.spin[2]]} scale={c.s} />;
      })}
    </>
  );
};

const Ready: React.FC = () => {
  const advance = useThree((s) => s.advance);
  const [h] = useState(() => delayRender('coin rain'));
  useEffect(() => {
    advance(performance.now());
    continueRender(h);
  }, [advance, h]);
  return null;
};

export const CoinRain: React.FC<{dur: number; n?: number}> = ({dur, n = 12}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const fade = interpolate(f, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade, pointerEvents: 'none'}}>
      <ThreeCanvas width={width} height={height} camera={{fov: 30, near: 0.1, far: 100, position: [0, 0, 14]}} gl={{antialias: true, alpha: true}}>
        <StudioEnv intensity={0.9} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[-3, 5, 6]} intensity={2.2} color="#fff4e0" />
        <Coins f={f} dur={dur} n={n} />
        <Ready />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
