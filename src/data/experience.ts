export type ExperienceState =
  | 'SAPLING'
  | 'STEM'
  | 'YOUNG_TREE'
  | 'FULL_TREE'
  | 'BRANCH_APPROACH'
  | 'BRANCH_CARD'
  | 'NEXT_BRANCH'
  | 'FULL_TREE_FINALE';

export type CameraScale =
  | 'MICROSCOPIC'
  | 'MACRO'
  | 'CLOSE'
  | 'MEDIUM'
  | 'WIDE'
  | 'ULTRA-WIDE';

export interface StageDefinition {
  id: ExperienceState;
  stageNumber: string;
  label: string;
  scaleLabel: CameraScale;
  headline: string;
  subheadline: string;
  poeticNote: string;
  scrollRange: [number, number];
}

export const EXPERIENCE_STAGES: StageDefinition[] = [
  {
    id: 'SAPLING',
    stageNumber: 'STAGE 01',
    label: 'SAPLING · MICROSCOPIC GENESIS',
    scaleLabel: 'MICROSCOPIC',
    headline: 'From Microscopic Stillness',
    subheadline: 'A fragile shoot parts the volcanic earth, drawn upward by a single thread of light.',
    poeticNote: 'What am I looking at? A beginning smaller than a breath.',
    scrollRange: [0.0, 0.18],
  },
  {
    id: 'STEM',
    stageNumber: 'STAGE 02',
    label: 'DEVELOPING STEM · EARLY VASCULARITY',
    scaleLabel: 'CLOSE',
    headline: 'The Ascending Stem',
    subheadline: 'Cell by cell, tender green tissue hardens into woody fiber as the first lateral shoots unfurl.',
    poeticNote: 'Time accelerates as the camera drifts backward through living mist.',
    scrollRange: [0.18, 0.36],
  },
  {
    id: 'YOUNG_TREE',
    stageNumber: 'STAGE 03',
    label: 'YOUNG TREE · ASYMMETRIC CANOPY',
    scaleLabel: 'MEDIUM',
    headline: 'Branching Into Space',
    subheadline: 'Asymmetric boughs reach outward to claim the air, catching shafts of golden forest light.',
    poeticNote: 'Growth is never a straight line—it bifurcates in search of light.',
    scrollRange: [0.36, 0.54],
  },
  {
    id: 'FULL_TREE',
    stageNumber: 'STAGE 04',
    label: 'FULL TREE · MONUMENTAL CROWN',
    scaleLabel: 'WIDE',
    headline: 'The Sovereign Architecture',
    subheadline: 'A living monument of root, heartwood, and ten thousand breathing leaves revealed in full scale.',
    poeticNote: 'From a fragile spark in the soil to an entire world.',
    scrollRange: [0.54, 0.71],
  },
  {
    id: 'BRANCH_CARD',
    stageNumber: 'STAGE 05',
    label: 'BRANCH EXPLORATION · LIVING MEMORIES',
    scaleLabel: 'CLOSE',
    headline: 'Stories Suspended in Time',
    subheadline: 'Every bough preserves a distinct epoch—approach each branch to inspect its memory.',
    poeticNote: 'There are stories hidden inside the canopy.',
    scrollRange: [0.71, 0.948],
  },
  {
    id: 'FULL_TREE_FINALE',
    stageNumber: 'FINALE',
    label: 'ETERNAL WHOLE · ULTRA-WIDE REVEAL',
    scaleLabel: 'ULTRA-WIDE',
    headline: 'Everything Starts Small.',
    subheadline: 'Growth is a collection of branches, moments, and quiet resilience that form something timeless.',
    poeticNote: 'Everything connects back to the whole.',
    scrollRange: [0.948, 1.0],
  },
];

export interface TimelineSnapshot {
  scrollProgress: number;
  scrollVelocity: number;
  state: ExperienceState;
  cameraScale: CameraScale;
  stageIndex: number;
  stageProgress: number;
  /** Continuous [0..1] tree biological growth factor (reaches 1.0 at full tree) */
  treeGrowth: number;
  /** Active branch index (0..4) when in branch exploration, or -1 */
  activeBranchIndex: number;
  /** [0..1] how locked-in the camera is on the active branch card (0 = travelling between branches, 1 = focused on card) */
  branchLockFactor: number;
  /** [0..1] finale radiance factor */
  finaleFactor: number;
}
