'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { BranchStoryData } from '@/data/branches';
import { ScrollStateRef } from '@/hooks/useScrollProgress';
import { computeTimelineSnapshot } from '@/hooks/useExperienceTimeline';

interface HangingCardProps {
  branch: BranchStoryData;
  index: number;
  scrollRef: React.MutableRefObject<ScrollStateRef>;
  reducedMotion: boolean;
  onSelectBranch: (branch: BranchStoryData) => void;
}

export function HangingCard({
  branch,
  index,
  scrollRef,
  reducedMotion,
  onSelectBranch,
}: HangingCardProps) {
  const pendulumRef = useRef<THREE.Group>(null);
  const cardMountRef = useRef<THREE.Group>(null);
  const cardLightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  const photoTexture = useTexture(branch.image);
  useMemo(() => {
    photoTexture.colorSpace = THREE.SRGBColorSpace;
    photoTexture.anisotropy = 4;
  }, [photoTexture]);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  const physicsRef = useRef({ angleX: 0, angleZ: 0, velX: 0, velZ: 0 });
  const cordLength = branch.cordLength || 1.1;

  useFrame((state) => {
    if (!pendulumRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    const s = scrollRef.current;
    const snap = computeTimelineSnapshot(s.smoothProgress, s.velocity);

    // Each memory card is revealed only when its own four-second visit begins.
    // Once revealed it remains hanging, so the archive builds naturally instead
    // of all 18 cards popping in together.
    const [branchStart] = branch.scrollRange;
    const cardReveal = THREE.MathUtils.smoothstep(
      s.smoothProgress,
      Math.max(0.0, branchStart - 0.012),
      Math.min(1.0, branchStart + 0.018)
    );
    pendulumRef.current.scale.setScalar(Math.max(0.0001, cardReveal));
    pendulumRef.current.visible = cardReveal > 0.005;

    if (cardMountRef.current) {
      const presentationScale = THREE.MathUtils.lerp(2, 1, snap.finaleFactor);
      const hoverScale = hovered ? 1.1 : 1;
      cardMountRef.current.scale.setScalar(presentationScale * hoverScale);
    }

    if (cardReveal <= 0.005) return;

    // Organic pendulum motion
    const p = physicsRef.current;
    const motionScale = reducedMotion ? 0.15 : 1.0;

    const windForceZ = Math.sin(elapsed * 0.72 + index * 1.4) * 0.015;
    const windForceX = Math.cos(elapsed * 0.58 + index * 1.1) * 0.012;
    const scrollImpulseZ = THREE.MathUtils.clamp(s.velocity * 0.1, -0.08, 0.08);

    const targetZ = (windForceZ + scrollImpulseZ + s.pointerX * 0.018) * motionScale;
    const targetX = (windForceX - s.pointerY * 0.015) * motionScale;

    p.velZ += (targetZ - p.angleZ) * 0.055;
    p.velX += (targetX - p.angleX) * 0.055;
    p.velZ *= 0.925;
    p.velX *= 0.925;
    p.angleZ += p.velZ;
    p.angleX += p.velX;

    pendulumRef.current.rotation.set(
      (branch.rotation?.x || 0) + p.angleX,
      (branch.rotation?.y || 0) + Math.sin(elapsed * 0.5 + index) * 0.02 * motionScale,
      branch.rotation.z + p.angleZ
    );

    if (cardLightRef.current) {
      cardLightRef.current.intensity = (hovered ? 1.2 : 0.55) * cardReveal;
    }
  });

  return (
    <group position={branch.branchAttachment.toArray()}>
      {/* Warm Golden Spotlight on Card Face */}
      <pointLight
        ref={cardLightRef}
        position={[0, -cordLength + 0.1, 0.35]}
        color="#ffe29c"
        intensity={0.28}
        distance={2.2}
      />

      <group ref={pendulumRef}>
        {/* Fairy Bulb at Branch Knot */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshBasicMaterial color="#ffe59e" />
        </mesh>

        {/* Golden Suspender Cord */}
        <mesh position={[0, -cordLength * 0.5, 0]}>
          <cylinderGeometry args={[0.003, 0.003, cordLength, 6]} />
          <meshStandardMaterial color="#d4a359" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Mid-cord Fairy Light */}
        <mesh position={[0, -cordLength * 0.5, 0]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshBasicMaterial color="#ffc86b" />
        </mesh>

        {/* CRISP WHITE ARCHIVAL MOUNT (POLAROID) */}
        <group
          ref={cardMountRef}
          position={[0, -cordLength, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectBranch(branch);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          {/* Polaroid Outer Frame */}
          <mesh position={[0, -0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.78, 0.014]} />
            <meshStandardMaterial color="#fcfaf4" roughness={0.75} metalness={0.02} />
          </mesh>

          {/* Thin Gold Inner Bevel */}
          <mesh position={[0, -0.38, 0.004]}>
            <boxGeometry args={[0.58, 0.74, 0.012]} />
            <meshStandardMaterial color={hovered ? '#ffd67a' : '#cfab5c'} metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Photographic Print */}
          <mesh position={[0, -0.30, 0.011]}>
            <planeGeometry args={[0.50, 0.50]} />
            <meshStandardMaterial map={photoTexture} roughness={0.35} metalness={0.05} />
          </mesh>

          {/* Archival title and description */}
          <Text
            position={[0, -0.62, 0.02]}
            fontSize={0.040}
            maxWidth={0.48}
            anchorX="center"
            anchorY="middle"
            textAlign="center"
            color="#2d251c"
          >
            {branch.title}
          </Text>
          <Text
            position={[0, -0.7, 0.02]}
            fontSize={0.022}
            maxWidth={0.48}
            anchorX="center"
            anchorY="middle"
            textAlign="center"
            color="#42392e"
          >
            {branch.description}
          </Text>
        </group>
      </group>
    </group>
  );
}