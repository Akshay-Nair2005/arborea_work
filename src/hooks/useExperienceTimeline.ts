import { branches } from '@/data/branches';
import {
  CameraScale,
  EXPERIENCE_STAGES,
  ExperienceState,
  TimelineSnapshot,
} from '@/data/experience';

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Pure function that computes the complete experience state machine snapshot
 * for any normalized scroll progress [0..1]. Used both inside Three.js useFrame
 * (for zero-latency 60fps animation) and in React UI components.
 */
export function computeTimelineSnapshot(
  scrollProgress: number,
  scrollVelocity = 0
): TimelineSnapshot {
  const p = clamp01(scrollProgress);

  // 1. Determine primary stage index
  let stageIndex = EXPERIENCE_STAGES.findIndex(
    (st) => p >= st.scrollRange[0] && (p < st.scrollRange[1] || (p === 1 && st.scrollRange[1] === 1))
  );
  if (stageIndex === -1) {
    stageIndex = p < 0.5 ? 0 : EXPERIENCE_STAGES.length - 1;
  }
  const activeStage = EXPERIENCE_STAGES[stageIndex];
  const stageSpan = Math.max(0.0001, activeStage.scrollRange[1] - activeStage.scrollRange[0]);
  const stageProgress = clamp01((p - activeStage.scrollRange[0]) / stageSpan);

  // 2. Slow, continuous biological growth [0..1]
  // Growth is deliberately stretched across the four manual/automatic bloom segments.
  // Stage 02 remains a slender stem, Stage 03 is still visibly juvenile, and the
  // mature crown is only fully established at the end of Stage 04.
  const treeGrowth = smoothstep(0.0, 0.71, p);

  // 3. Camera scale progression: MICROSCOPIC -> MACRO -> CLOSE -> MEDIUM -> WIDE -> ULTRA-WIDE
  let cameraScale: CameraScale = 'MICROSCOPIC';
  if (p < 0.07) {
    cameraScale = 'MICROSCOPIC';
  } else if (p < 0.18) {
    cameraScale = 'MACRO';
  } else if (p < 0.36) {
    cameraScale = 'CLOSE';
  } else if (p < 0.54) {
    cameraScale = 'MEDIUM';
  } else if (p < 0.64) {
    cameraScale = 'WIDE';
  } else if (p < 0.71) {
    cameraScale = 'ULTRA-WIDE';
  } else if (p < 0.948) {
    cameraScale = 'CLOSE';
  } else {
    cameraScale = 'ULTRA-WIDE';
  }

  // 4. Branch exploration sub-state machine (0.71 -> 0.948)
  let state: ExperienceState = activeStage.id;
  let activeBranchIndex = -1;
  let branchLockFactor = 0;

  if (p >= 0.71 && p < 0.948) {
    const idx = branches.findIndex(
      (b) => p >= b.scrollRange[0] && p <= b.scrollRange[1]
    );
    activeBranchIndex = idx !== -1 ? idx : branches.length - 1;
    const b = branches[activeBranchIndex];
    const localT = clamp01(
      (p - b.scrollRange[0]) / Math.max(0.0001, b.scrollRange[1] - b.scrollRange[0])
    );

    // Within each branch's scroll window:
    // 0.00 -> 0.28: Camera arcs from previous branch / canopy toward this branch (BRANCH_APPROACH / NEXT_BRANCH)
    // 0.28 -> 0.82: Camera is settled in front of the hanging 3D photo card (BRANCH_CARD)
    // 0.82 -> 1.00: Camera gently releases to transition to the next branch
    const enterCurve = smoothstep(0.05, 0.3, localT);
    const exitCurve = 1.0 - smoothstep(0.78, 0.98, localT);
    branchLockFactor = enterCurve * exitCurve;

    if (localT < 0.25) {
      state = activeBranchIndex === 0 ? 'BRANCH_APPROACH' : 'NEXT_BRANCH';
    } else if (localT > 0.84 && activeBranchIndex < branches.length - 1) {
      state = 'NEXT_BRANCH';
    } else {
      state = 'BRANCH_CARD';
    }
  }

  // 5. Finale factor (0.948 -> 1.0)
  const finaleFactor = smoothstep(0.945, 0.99, p);

  return {
    scrollProgress: p,
    scrollVelocity,
    state,
    cameraScale,
    stageIndex,
    stageProgress,
    treeGrowth,
    activeBranchIndex,
    branchLockFactor,
    finaleFactor,
  };
}

export function useExperienceTimeline(scrollProgress: number, scrollVelocity: number): TimelineSnapshot {
  return computeTimelineSnapshot(scrollProgress, scrollVelocity);
}
