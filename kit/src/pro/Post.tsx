import React, {useEffect, useMemo} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

// Lens finish for the 3D films: depth of field (BokehPass; blur = |depth − focus| × aperture, capped at maxblur, all
// in world units from the camera) so the hero element is sharp and the layers in front and behind soften, plus a
// soft bloom so chrome, lamps and highlights glint. Takes over rendering (useFrame priority 1); animate `focus` per
// beat for focus pulls.
export const Post: React.FC<{focus: number; aperture: number; maxblur?: number; bloom?: number}> = ({focus, aperture, maxblur = 0.008, bloom = 0.35}) => {
  const {gl, scene, camera, size} = useThree();
  const fx = useMemo(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, {focus, aperture, maxblur});
    composer.addPass(bokeh);
    const glow = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), bloom, 0.5, 0.9); // only the brightest highlights
    composer.addPass(glow);
    composer.addPass(new OutputPass());
    return {composer, bokeh};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);
  useEffect(() => {
    fx.composer.setSize(size.width, size.height);
  }, [fx, size.width, size.height]);
  const u = fx.bokeh.uniforms as Record<string, {value: number}>;
  u.focus.value = focus;
  u.aperture.value = aperture;
  u.maxblur.value = maxblur;
  useFrame(() => fx.composer.render(), 1);
  return null;
};
