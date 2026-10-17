import React, {useLayoutEffect} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

const Rig: React.FC<{
  pos: [number, number, number];
  look: [number, number, number];
  roll?: number;
  fov?: number;
}> = ({pos, look, roll = 0, fov = 40}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(...look);
    if ('fov' in camera) {
      (camera as {fov: number}).fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

export interface ThreeStageProps {
  width?: number;
  height?: number;
  fov?: number;
  pos?: [number, number, number];
  look?: [number, number, number];
  roll?: number;
  fogColor?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/** Full-frame Transparent WebGL Stage for Remotion 3D Elements */
export const ThreeStage: React.FC<ThreeStageProps> = ({
  width = 1080,
  height = 1920,
  fov = 40,
  pos = [0, 0, 10],
  look = [0, 0, 0],
  roll = 0,
  fogColor,
  children,
  style,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 30,
        ...style,
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        camera={{fov, position: pos, near: 0.1, far: 400}}
        gl={{antialias: true, alpha: true}}
      >
        <Rig pos={pos} look={look} roll={roll} fov={fov} />
        {fogColor && <primitive attach="fog" object={new THREE.Fog(fogColor, 5, 50)} />}

        {/* Ambient & Directional Gold Key Lights */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 7]} intensity={2.5} color="#fff6e5" />
        <directionalLight position={[-6, -4, -4]} intensity={0.9} color="#dfb25a" />
        <pointLight position={[0, 4, 3]} intensity={1.5} color="#ffd480" />

        {children}
      </ThreeCanvas>
    </div>
  );
};
