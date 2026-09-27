'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ScrollStateRef } from '@/hooks/useScrollProgress';

interface EnvironmentProps {
  scrollRef: React.MutableRefObject<ScrollStateRef>;
  isMobile: boolean;
}

export function Environment({ scrollRef, isMobile }: EnvironmentProps) {
  const { scene } = useThree();
  const spotRef = useRef<THREE.SpotLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    // Keep clean dark atmosphere
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = 0.024;
    }
  });

  return (
    <>
      {/* 1. Dark Chiaroscuro Background */}
      <color attach="background" args={['#030302']} />
      <fogExp2 attach="fog" args={['#030302', 0.024]} />

      {/* 2. Soft Ambient Ground/Sky Balance */}
      <hemisphereLight args={['#323f30', '#100d0a', 0.65]} />

      {/* 3. PRIMARY OVERHEAD SPOTLIGHT (The distinct God-Ray beam from reference) */}
      <spotLight
        ref={spotRef}
        position={[0, 15, 1]}
        target-position={[0, 2.5, 0]}
        color="#fff4db"
        intensity={6.5}
        angle={0.65}
        penumbra={0.88}
        castShadow={!isMobile}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
      />

      {/* 4. Secondary Soft Sun Angle */}
      <directionalLight
        ref={sunRef}
        position={[2, 12, 3]}
        color="#ffe3ba"
        intensity={2.8}
        castShadow={false}
      />

      {/* 5. Rim Backlight (Traces gold highlights on branches and outer leaves) */}
      <directionalLight
        ref={rimRef}
        position={[0, 6, -8]}
        color="#d4efa5"
        intensity={2.6}
      />

      {/* 6. Warm Amber Fill inside Canopy */}
      <pointLight
        position={[0, 4.0, 0.2]}
        color="#ffc364"
        intensity={3.2}
        distance={11}
      />
    </>
  );
}