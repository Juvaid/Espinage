import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';

const createCoinTexture = (symbol: string, accentColor: string) => {
  const s = 512;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;

  // Radial metallic shine
  const grad = g.createRadialGradient(s * 0.4, s * 0.35, s * 0.05, s / 2, s / 2, s / 2);
  grad.addColorStop(0, '#ffe7a6');
  grad.addColorStop(0.55, '#dcaa4e');
  grad.addColorStop(1, '#9c7128');
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);

  // Rim groove
  g.strokeStyle = 'rgba(90, 60, 15, 0.6)';
  g.lineWidth = 12;
  g.beginPath();
  g.arc(s / 2, s / 2, s * 0.4, 0, Math.PI * 2);
  g.stroke();

  // Embossed symbol
  g.font = `700 ${s * 0.46}px -apple-system, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // Shadow emboss
  g.fillStyle = 'rgba(70, 40, 10, 0.85)';
  g.fillText(symbol, s / 2 + 5, s / 2 + 10);
  // Highlight
  g.fillStyle = 'rgba(255, 248, 220, 0.9)';
  g.fillText(symbol, s / 2 - 4, s / 2 + 2);
  // Face
  g.fillStyle = accentColor;
  g.fillText(symbol, s / 2, s / 2 + 6);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export interface SpinningCoin3DProps {
  position?: [number, number, number];
  scale?: number;
  symbol?: string;
  accentColor?: string;
  spinSpeed?: number;
}

export const SpinningCoin3D: React.FC<SpinningCoin3DProps> = ({
  position = [0, 0, 0],
  scale = 1.8,
  symbol = '₹',
  accentColor = '#c9953c',
  spinSpeed = 0.05,
}) => {
  const frame = useCurrentFrame();

  const {geo, mats} = useMemo(() => {
    const texture = createCoinTexture(symbol, accentColor);
    const rimMat = new THREE.MeshStandardMaterial({
      color: '#dcaa4e',
      metalness: 0.85,
      roughness: 0.25,
    });
    const faceMat = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.8,
      roughness: 0.3,
    });

    const geometry = new THREE.CylinderGeometry(1, 1, 0.16, 64);
    return {geo: geometry, mats: [rimMat, faceMat, faceMat]};
  }, [symbol, accentColor]);

  // Frame-driven 3D rotation
  const rotY = frame * spinSpeed;
  const rotX = 0.35 + Math.sin(frame * 0.03) * 0.12;

  return (
    <mesh
      geometry={geo}
      material={mats}
      position={position}
      rotation={[rotX, rotY, 0]}
      scale={scale}
    />
  );
};
