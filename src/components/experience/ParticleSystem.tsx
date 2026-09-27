'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ScrollStateRef } from '@/hooks/useScrollProgress';
import { computeTimelineSnapshot } from '@/hooks/useExperienceTimeline';

interface ParticleSystemProps {
  scrollRef: React.MutableRefObject<ScrollStateRef>;
  isMobile: boolean;
  reducedMotion: boolean;
}

function createSoftParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 248, 220, 1)');
    grad.addColorStop(0.35, 'rgba(225, 198, 130, 0.65)');
    grad.addColorStop(1, 'rgba(225, 198, 130, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function ParticleSystem({
  scrollRef,
  isMobile,
  reducedMotion,
}: ParticleSystemProps) {
  const microPointsRef = useRef<THREE.Points>(null);
  const canopyPointsRef = useRef<THREE.Points>(null);

  const particleTexture = useMemo(() => createSoftParticleTexture(), []);

  // 1. Microscopic Soil & Sapling Spores (constructed cleanly via BufferGeometry)
  const { microGeometry, microPhases } = useMemo(() => {
    const count = isMobile ? 120 : 240;
    const pos = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 1.6) * 1.4 + 0.03;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.random() * 1.35 + 0.01;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { microGeometry: geom, microPhases: phases };
  }, [isMobile]);

  // 2. Canopy Golden Dust Motes & Atmospheric Pollen
  const canopyGeometry = useMemo(() => {
    const count = isMobile ? 220 : 480;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    const gold = new THREE.Color('#f2d488');
    const sage = new THREE.Color('#95d19c');
    const warmWhite = new THREE.Color('#fff7e6');

    for (let i = 0; i < count; i++) {
      const r = 0.4 + Math.random() * 6.8;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = 0.2 + Math.random() * 8.2;
      pos[i * 3 + 2] = Math.sin(theta) * r;

      const c = i % 3 === 0 ? gold : i % 3 === 1 ? sage : warmWhite;
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return geom;
  }, [isMobile]);

  useFrame((state) => {
    if (reducedMotion) return;
    const elapsed = state.clock.getElapsedTime();
    const s = scrollRef.current;
    const snap = computeTimelineSnapshot(s.smoothProgress, s.velocity);

    if (microPointsRef.current) {
      const posAttr = microPointsRef.current.geometry.attributes
        .position as THREE.BufferAttribute;
      for (let i = 0; i < microPhases.length; i++) {
        const phase = microPhases[i];
        const y = posAttr.getY(i) + 0.0007;
        posAttr.setY(i, y > 1.35 ? 0.01 : y);
        posAttr.setX(
          i,
          posAttr.getX(i) + Math.sin(elapsed * 0.9 + phase) * 0.0004
        );
      }
      posAttr.needsUpdate = true;
      const mat = microPointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = THREE.MathUtils.lerp(0.65, 0.18, snap.treeGrowth);
    }

    if (canopyPointsRef.current) {
      canopyPointsRef.current.rotation.y = elapsed * 0.018;
      const mat = canopyPointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.22 + snap.treeGrowth * 0.38 + snap.finaleFactor * 0.25;
    }
  });

  return (
    <group name="atmospheric-particles" key={isMobile ? 'mobile-pt' : 'desktop-pt'}>
      <points ref={microPointsRef} geometry={microGeometry}>
        <pointsMaterial
          map={particleTexture}
          color="#d8e8c8"
          size={0.022}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={canopyPointsRef} geometry={canopyGeometry}>
        <pointsMaterial
          map={particleTexture}
          vertexColors
          size={0.095}
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
