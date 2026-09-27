'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BranchStoryData } from '@/data/branches';
import { ScrollStateRef } from '@/hooks/useScrollProgress';
import { computeTimelineSnapshot } from '@/hooks/useExperienceTimeline';
import { audioEngine } from '@/lib/audioEngine';
import { CameraController } from './CameraController';
import { Environment } from './Environment';
import { TreeGrowth } from './TreeGrowth';
import { BranchExplorer } from './BranchExplorer';
import { ParticleSystem } from './ParticleSystem';

interface TreeSceneProps {
  scrollRef: React.MutableRefObject<ScrollStateRef>;
  reducedMotion: boolean;
  onSelectBranch: (branch: BranchStoryData) => void;
}

function AudioTimelineSync({
  scrollRef,
}: {
  scrollRef: React.MutableRefObject<ScrollStateRef>;
}) {
  useFrame(() => {
    const s = scrollRef.current;
    const snap = computeTimelineSnapshot(s.smoothProgress, s.velocity);
    audioEngine.updateFromTimeline(
      s.smoothProgress,
      s.velocity,
      snap.activeBranchIndex
    );
  });
  return null;
}

export function TreeScene({
  scrollRef,
  reducedMotion,
  onSelectBranch,
}: TreeSceneProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport, { passive: true });
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#070a07]"
      aria-hidden="true"
    >
      <Canvas
        shadows={!isMobile}
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        camera={{
          position: [0, 0.22, 0.72],
          fov: isMobile ? 50 : 42,
          near: 0.02,
          far: 65,
        }}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          alpha: false,
        }}
      >
        <Environment scrollRef={scrollRef} isMobile={isMobile} />
        <CameraController
          scrollRef={scrollRef}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
        />
        <Suspense fallback={null}>
          <TreeGrowth
            scrollRef={scrollRef}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
          />
          <BranchExplorer
            scrollRef={scrollRef}
            reducedMotion={reducedMotion}
            onSelectBranch={onSelectBranch}
          />
        </Suspense>
        <ParticleSystem
          scrollRef={scrollRef}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
        />
        <AudioTimelineSync scrollRef={scrollRef} />

        {!isMobile && (
          <EffectComposer enableNormalPass={false}>
            <Bloom
              luminanceThreshold={0.82}
              mipmapBlur
              intensity={0.22}
              radius={0.55}
            />
            <Vignette eskil={false} offset={0.16} darkness={0.72} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
