import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';
import {asset} from '../lib/asset';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

// A still inside a card, moved like a camera shot (ported from the 54D DepthPhoto): the picture is a finely divided
// plane pushed toward the camera by its depth map (public/depth, from scripts/depth_maps.py; ported from crowncrest-skypaddle), and the
// camera travels one short, steady path, so the road and the tree slide against the building. The picture covers
// the card like object-fit: cover, with `focusY` choosing which band of a tall picture the card shows.
const D = 10;
const FOV = 30;
export type Move = {from: [number, number, number]; to: [number, number, number]};

const Plane: React.FC<{src: string; depth: string; aspect: number; imgAspect: number; focusY: number; strength: number; move: Move; dur: number}> = ({src, depth, aspect, imgAspect, focusY, strength, move, dur}) => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  const advance = useThree((s) => s.advance);
  const [tex, setTex] = useState<{map: THREE.Texture; depth: THREE.Texture} | null>(null);
  const [handle] = useState(() => delayRender(`depth card ${src}`));
  useEffect(() => {
    const l = new THREE.TextureLoader();
    Promise.all([l.loadAsync(asset(src)), l.loadAsync(asset(depth))]).then(
      ([map, d]) => {
        map.colorSpace = THREE.NoColorSpace;
        map.minFilter = THREE.LinearMipmapLinearFilter;
        map.anisotropy = 8;
        setTex({map, depth: d});
      },
      () => continueRender(handle),
    );
  }, [src, depth, handle]);
  const visH = 2 * D * Math.tan(((FOV / 2) * Math.PI) / 180);
  const visW = visH * aspect;
  // cover the card, oversized 14% so the moving camera never sees past the picture's edge
  const [pw, ph] = aspect > imgAspect ? [visW, visW / imgAspect] : [visH * imgAspect, visH];
  const spare = Math.max(0, ph * 1.14 - visH * 1.14) / 2;
  const offY = (0.5 - focusY) * 2 * spare; // focusY 0 = show the top of the picture, 1 = the bottom
  const mat = useMemo(
    () =>
      tex &&
      new THREE.ShaderMaterial({
        uniforms: {map: {value: tex.map}, depth: {value: tex.depth}, strength: {value: strength}},
        vertexShader: `uniform sampler2D depth; uniform float strength; varying vec2 vUv;
          void main() { vUv = uv; vec3 p = position; p.z += texture2D(depth, uv).r * strength;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
        fragmentShader: `uniform sampler2D map; varying vec2 vUv; void main() { gl_FragColor = texture2D(map, vUv); }`,
      }),
    [tex, strength],
  );
  useEffect(() => {
    if (!mat) return;
    advance(performance.now());
    continueRender(handle);
  }, [mat, handle, advance]);
  // one steady travel: near-constant speed, softened at both ends
  const u = interpolate(frame, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const k = 0.6 * u + 0.4 * (0.5 - 0.5 * Math.cos(Math.PI * u));
  const p = move.from.map((v, i) => v + (move.to[i] - v) * k);
  camera.position.set(p[0], p[1], D + p[2]);
  camera.lookAt(p[0] * 0.35, p[1] * 0.35, 0);
  if (!mat) return null;
  return (
    <mesh material={mat} position={[0, -offY, 0]} scale={[1.14, 1.14, 1]}>
      <planeGeometry args={[pw, ph, 240, 420]} />
    </mesh>
  );
};

export const DepthCard: React.FC<{src: string; depth: string; w: number; h: number; dur: number; move: Move; imgAspect?: number; focusY?: number; strength?: number}> = ({
  src,
  depth,
  w,
  h,
  dur,
  move,
  imgAspect = 9 / 16,
  focusY = 0.5,
  strength = 0.9,
}) => (
  <div style={{position: 'absolute', inset: 0}}>
    <ThreeCanvas width={w} height={h} camera={{fov: FOV, near: 0.1, far: 100, position: [0, 0, D]}} gl={{antialias: true}} flat linear>
      <Plane src={src} depth={depth} aspect={w / h} imgAspect={imgAspect} focusY={focusY} strength={strength} move={move} dur={dur} />
    </ThreeCanvas>
  </div>
);
