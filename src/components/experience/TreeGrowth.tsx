'use client';

import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { TreeModel } from './TreeModel';
import { ScrollStateRef } from '@/hooks/useScrollProgress';

interface TreeGrowthProps {
  scrollRef: React.MutableRefObject<ScrollStateRef>;
  isMobile: boolean;
  reducedMotion: boolean;
}

export function TreeGrowth({ scrollRef, isMobile, reducedMotion }: TreeGrowthProps) {
  const soilTexture = useTexture('/textures/forest-soil.jpg');

  useMemo(() => {
    soilTexture.wrapS = THREE.RepeatWrapping;
    soilTexture.wrapT = THREE.RepeatWrapping;
    soilTexture.repeat.set(16, 16);
    soilTexture.colorSpace = THREE.SRGBColorSpace;
  }, [soilTexture]);

  // Wide ground floor with smooth fading edges
  const floorGeom = useMemo(() => {
    return new THREE.PlaneGeometry(36, 36, 32, 32);
  }, []);

  return (
    <group name="pedestal-clearing">
      {/* Ground plane */}
      <mesh geometry={floorGeom} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
        <meshStandardMaterial
          map={soilTexture}
          bumpMap={soilTexture}
          bumpScale={0.05}
          color="#1c1611"
          roughness={0.94}
        />
      </mesh>

      {/* Tree Model with original growth pipeline */}
      <TreeModel scrollRef={scrollRef} isMobile={isMobile} reducedMotion={reducedMotion} />
    </group>
  );
}