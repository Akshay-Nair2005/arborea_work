'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ScrollStateRef {
  /** Raw normalized scroll [0..1] from window scroll position */
  targetProgress: number;
  /** Smoothly damped scroll progress [0..1] updated at 60fps */
  smoothProgress: number;
  /** Instantaneous scroll velocity [-1..1] */
  velocity: number;
  /** Normalized mouse coordinates [-1..1] for subtle parallax */
  pointerX: number;
  pointerY: number;
  transitionRate: number;
}

export function useScrollProgress(reducedMotion: boolean) {
  const stateRef = useRef<ScrollStateRef>({
    targetProgress: 0,
    smoothProgress: 0,
    velocity: 0,
    pointerX: 0,
    pointerY: 0,
    transitionRate: 0.055,
  });

  // UI snapshot updated when progress shifts noticeably so React UI stays light
  const [uiProgress, setUiProgress] = useState(0);
  const [uiVelocity, setUiVelocity] = useState(0);

  const scrollToProgress = useCallback((normalizedTarget: number) => {
    const clamped = Math.max(0, Math.min(1, normalizedTarget));
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({
      top: clamped * maxScroll,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [reducedMotion]);

  useEffect(() => {
    const updateTargetFromWindow = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const raw = window.scrollY / maxScroll;
      stateRef.current.targetProgress = Math.max(0, Math.min(1, raw));
    };

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = -(e.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
      stateRef.current.pointerX = nx;
      stateRef.current.pointerY = ny;
    };

    updateTargetFromWindow();
    window.addEventListener('scroll', updateTargetFromWindow, { passive: true });
    window.addEventListener('resize', updateTargetFromWindow, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let rafId = 0;
    let lastUiUpdate = 0;

    const tick = (now: number) => {
      const s = stateRef.current;
      const damping = reducedMotion ? 0.35 : Math.max(0.006, Math.min(0.12, s.transitionRate));
      const delta = s.targetProgress - s.smoothProgress;

      if (Math.abs(delta) > 0.00001) {
        s.smoothProgress += delta * damping;
        s.velocity = delta * 18;
      } else {
        s.smoothProgress = s.targetProgress;
        s.velocity *= 0.85;
      }

      if (now - lastUiUpdate > 48) {
        lastUiUpdate = now;
        setUiProgress((prev) => (Math.abs(prev - s.smoothProgress) > 0.0008 ? s.smoothProgress : prev));
        setUiVelocity((prev) => (Math.abs(prev - s.velocity) > 0.005 ? s.velocity : prev));
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', updateTargetFromWindow);
      window.removeEventListener('resize', updateTargetFromWindow);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  return {
    scrollRef: stateRef,
    uiProgress,
    uiVelocity,
    scrollToProgress,
  };
}
