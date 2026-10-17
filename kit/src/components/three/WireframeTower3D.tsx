import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';

export interface WireframeTower3DProps {
  levels?: number;
  position?: [number, number, number];
  scale?: number;
  lineColor?: string;
  floorHeight?: number;
}

/** 3D Architectural Wireframe Tower with Glowing Edge Meshes */
export const WireframeTower3D: React.FC<WireframeTower3DProps> = ({
  levels = 5,
  position = [0, -2, 0],
  scale = 1.2,
  lineColor = '#DFB25A',
  floorHeight = 0.85,
}) => {
  const frame = useCurrentFrame();

  const {boxes, lineMaterial} = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: lineColor,
      linewidth: 2,
    });

    const items = Array.from({length: levels}, (_, i) => {
      const w = 2.4 - i * 0.15;
      const d = 2.4 - i * 0.15;
      const boxGeo = new THREE.BoxGeometry(w, floorHeight * 0.92, d);
      const edgeGeo = new THREE.EdgesGeometry(boxGeo);
      return {
        geo: edgeGeo,
        y: i * floorHeight,
      };
    });

    return {boxes: items, lineMaterial: mat};
  }, [levels, lineColor, floorHeight]);

  // Slow architectural turntable rotation
  const rotY = frame * 0.015;

  return (
    <group position={position} rotation={[0.25, rotY, 0]} scale={scale}>
      {boxes.map((b, idx) => (
        <lineSegments
          key={idx}
          geometry={b.geo}
          material={lineMaterial}
          position={[0, b.y, 0]}
        />
      ))}
    </group>
  );
};
