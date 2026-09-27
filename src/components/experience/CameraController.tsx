'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { branches } from '@/data/branches';
import { ScrollStateRef } from '@/hooks/useScrollProgress';

interface CameraControllerProps {
  scrollRef: React.MutableRefObject<ScrollStateRef>;
  isMobile: boolean;
  reducedMotion: boolean;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function CameraController({
  scrollRef,
  isMobile,
  reducedMotion,
}: CameraControllerProps) {
  const { camera } = useThree();

  const currentPosRef = useRef(new THREE.Vector3(0, 0.32, 0.68));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0.16, 0));

  // --- PHASE 1: GROWTH SPLINE (0.00 -> 0.71) ---
  const { growthPosCurve, growthTargetCurve } = useMemo(() => {
    const mobileZScale = isMobile ? 1.35 : 1.0;

    const posCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.32, 0.68 * mobileZScale),
      new THREE.Vector3(0.18, 0.42, 1.22 * mobileZScale),
      new THREE.Vector3(-0.65, 1.35, 3.1 * mobileZScale),
      new THREE.Vector3(1.25, 2.75, 7.2 * mobileZScale),
      new THREE.Vector3(-0.35, 3.35, 14.5 * mobileZScale),
      new THREE.Vector3(0.0, 3.0, 18.2 * mobileZScale),
    ]);

    const targetCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.16, 0.0),
      new THREE.Vector3(0.0, 0.28, 0.0),
      new THREE.Vector3(0.0, 1.25, 0.0),
      new THREE.Vector3(0.0, 2.45, 0.0),
      new THREE.Vector3(0.0, 2.75, 0.0),
      new THREE.Vector3(0.0, 2.85, 0.0),
    ]);

    return { growthPosCurve: posCurve, growthTargetCurve: targetCurve };
  }, [isMobile]);

  const desiredPos = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const s = scrollRef.current;
    const p = THREE.MathUtils.clamp(s.smoothProgress, 0, 1);
    const mobileCardZOffset = isMobile ? 0.65 : 0.0;

    if (p <= 0.71) {
      // PHASE 1: Growth Spline
      const curveT = THREE.MathUtils.clamp(p / 0.71, 0, 1);
      growthPosCurve.getPointAt(curveT, desiredPos);
      growthTargetCurve.getPointAt(curveT, desiredTarget);

    } else if (p < 0.948) {
      // PHASE 2: Branch & Poster Inspection
      const bIdx = branches.findIndex(
        (b) => p >= b.scrollRange[0] && p <= b.scrollRange[1]
      );
      const activeIdx = bIdx !== -1 ? bIdx : Math.min(branches.length - 1, Math.floor((p - 0.71) / (0.238 / 18)));
      const branch = branches[activeIdx] || branches[0];
      const [start, end] = branch.scrollRange || [0.71, 0.948];
      const localT = THREE.MathUtils.clamp((p - start) / Math.max(0.0001, end - start), 0, 1);

      const cardCamPos = new THREE.Vector3(
        branch.cameraPosition.x,
        branch.cameraPosition.y,
        branch.cameraPosition.z + mobileCardZOffset
      );
      const cardTarget = branch.cameraTarget;

      if (localT < 0.3) {
        const t = smoothstep(0.0, 0.3, localT);
        desiredPos.lerpVectors(new THREE.Vector3(0, 3.0, isMobile ? 25.5 : 19.6), cardCamPos, t);
        desiredTarget.lerpVectors(new THREE.Vector3(0, 2.85, 0), cardTarget, t);
      } else if (localT <= 0.75) {
        desiredPos.copy(cardCamPos);
        desiredTarget.copy(cardTarget);
      } else {
        const t = smoothstep(0.75, 1.0, localT);
        desiredPos.lerpVectors(cardCamPos, new THREE.Vector3(0, 3.0, isMobile ? 25.5 : 19.6), t);
        desiredTarget.lerpVectors(cardTarget, new THREE.Vector3(0, 2.85, 0), t);
      }

    } else {
      // PHASE 3: STAGE 06 FINALE (Wide view matching the reference)
      const finaleT = smoothstep(0.948, 0.995, p);
      const startPos = new THREE.Vector3(0.0, 3.0, isMobile ? 25.5 : 19.6);
      const endPos = new THREE.Vector3(0.0, 3.05, isMobile ? 25.5 : 19.6);

      const startTarget = new THREE.Vector3(0.0, 2.85, 0.0);
      const endTarget = new THREE.Vector3(0.0, 2.65, 0.0);

      desiredPos.lerpVectors(startPos, endPos, finaleT);
      desiredTarget.lerpVectors(startTarget, endTarget, finaleT);
    }

    if (!reducedMotion && p < 0.948) {
      const distScale = THREE.MathUtils.clamp(desiredPos.length() * 0.02, 0.02, 0.2);
      desiredPos.x += s.pointerX * distScale + Math.sin(elapsed * 0.4) * distScale * 0.15;
      desiredPos.y += s.pointerY * distScale * 0.5 + Math.cos(elapsed * 0.35) * distScale * 0.12;
    }

    const lerpFactor = 1 - Math.exp(-(reducedMotion ? 15 : 7) * Math.min(delta, 0.05));
    currentPosRef.current.lerp(desiredPos, lerpFactor);
    currentLookAtRef.current.lerp(desiredTarget, lerpFactor);

    camera.position.copy(currentPosRef.current);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
}