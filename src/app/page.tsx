'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { branches } from '@/data/branches';
import { ScrollStateRef } from '@/hooks/useScrollProgress';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const TreeScene = dynamic(
  () => import('@/components/experience/TreeScene').then((mod) => mod.TreeScene),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#060907]">
        <div className="h-8 w-8 rounded-full border border-[#d4af37]/40 border-t-[#e5c992] animate-spin" />
      </div>
    ),
  }
);

const GROWTH_STEPS = [0, 0.18, 0.36, 0.54, 0.71];

function setPresentationTarget(
  scrollRef: React.MutableRefObject<ScrollStateRef>,
  value: number,
  transitionRate = 0.055
) {
  scrollRef.current.transitionRate = transitionRate;
  scrollRef.current.targetProgress = Math.max(0, Math.min(1, value));
}

export default function HomePage() {
  const [reducedMotion] = useReducedMotion();
  const { scrollRef, uiProgress } = useScrollProgress(reducedMotion);
  const [growthStep, setGrowthStep] = useState(0);
  const phaseRef = useRef<'growth' | 'photos' | 'finale' | 'paused'>('growth');
  const photoIndexRef = useRef(-1);
  const growthStepRef = useRef(0);

  const branchMidpoint = (index: number) => {
    const b = branches[index];
    if (!b) return 0.71;
    return b.scrollRange[0] + (b.scrollRange[1] - b.scrollRange[0]) * 0.52;
  };

  const advanceGrowth = () => {
    if (phaseRef.current === 'finale' || phaseRef.current === 'paused') {
      phaseRef.current = 'photos';
      photoIndexRef.current = branches.length - 1;
      setPresentationTarget(scrollRef, branchMidpoint(branches.length - 1), 0.055);
      return;
    }

    if (phaseRef.current === 'photos') {
      const next = photoIndexRef.current + 1;
      if (next >= branches.length) {
        phaseRef.current = 'finale';
        setPresentationTarget(scrollRef, 0.995, 0.035);
        return;
      }
      photoIndexRef.current = next;
      setPresentationTarget(scrollRef, branchMidpoint(next), 0.055);
      return;
    }

    const next = Math.min(4, growthStepRef.current + 1);
    growthStepRef.current = next;
    setGrowthStep(next);
    setPresentationTarget(scrollRef, GROWTH_STEPS[next], 0.022);
    if (next === 4) {
      phaseRef.current = 'photos';
      photoIndexRef.current = 0;
      setPresentationTarget(scrollRef, branchMidpoint(0), 0.055);
    }
  };

  const retreatGrowth = () => {
    if (phaseRef.current === 'finale') {
      phaseRef.current = 'photos';
      photoIndexRef.current = branches.length - 1;
      setPresentationTarget(scrollRef, branchMidpoint(branches.length - 1), 0.055);
      return;
    }

    if (phaseRef.current === 'photos' && photoIndexRef.current > 0) {
      photoIndexRef.current -= 1;
      setPresentationTarget(scrollRef, branchMidpoint(photoIndexRef.current), 0.055);
      return;
    }

    phaseRef.current = 'growth';
    photoIndexRef.current = -1;
    const next = Math.max(0, growthStepRef.current - 1);
    growthStepRef.current = next;
    setGrowthStep(next);
    setPresentationTarget(scrollRef, GROWTH_STEPS[next], 0.022);
  };

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    setPresentationTarget(scrollRef, 0, 0.022);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'ArrowRight') {
        event.preventDefault();
        advanceGrowth();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        retreatGrowth();
      } else if (event.key === ' ' && phaseRef.current === 'paused') {
        event.preventDefault();
        phaseRef.current = 'growth';
        growthStepRef.current = 0;
        photoIndexRef.current = -1;
        setGrowthStep(0);
        setPresentationTarget(scrollRef, 0, 0.022);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#060907] select-none">
      <TreeScene
        scrollRef={scrollRef}
        reducedMotion={reducedMotion}
        onSelectBranch={() => undefined}
      />
      {uiProgress >= 0.948 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-10 z-30 flex justify-center">
          <Link
            href="/students"
            className="pointer-events-auto border border-[#d4af37]/70 bg-black/55 px-7 py-4 font-mono text-[10px] uppercase tracking-[0.34em] text-[#f8e7b4] shadow-[0_0_30px_rgba(212,175,55,0.18)] backdrop-blur-md transition-all hover:border-[#ffe59e] hover:bg-[#d4af37]/15"
          >
            Meet the MCA 26—28 cohort
          </Link>
        </div>
      )}
      {/* <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center">
        <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.28em] text-white/45 backdrop-blur-sm">
          ENTER · GROWTH / CARD · ← / → · NAVIGATE · SPACE · REPLAY
        </div>
      </div> */}
    </main>
  );
}
