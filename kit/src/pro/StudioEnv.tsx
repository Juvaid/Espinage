import React, {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

// Soft studio reflections for metal and clay in 3D scenes (three's RoomEnvironment through PMREM).
export const StudioEnv: React.FC<{intensity?: number}> = ({intensity = 0.55}) => {
  const {gl, scene} = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
};
