import * as THREE from 'three';

export interface BranchStoryData {
  id: string;
  index: string;
  subtitle: string;
  extendedStory: string;
  category: string;
  year: string;
  title: string;
  description: string;
  ctaLabel: string;
  image: string;
  accentColor: string;
  branchAttachment: THREE.Vector3;
  cardPosition: THREE.Vector3;
  cameraApproach: THREE.Vector3;
  cameraPosition: THREE.Vector3;
  cameraTarget: THREE.Vector3;
  rotation: THREE.Euler;
  scrollRange: [number, number];
  cordLength: number;
  metadata: {
    coordinates: string;
    elevation: string;
    specimenId: string;
    specimen: string;
    epoch: string;
  };
}

const titles = [
  'The Pixels Techfest', 'The Avishkar Competition', 'Innov8', 'Taekwondo Champion',
  'Active SPOC', 'Emerald Engine', 'The Moss Mantle', 'Rings of Patience',
  'The Core Pillar', 'Crown Architecture', 'Solar Harvest', 'Avian Haven',
  'Summer Lightning', 'Vocal of Winds', 'Acorn Crop', 'The Great Limb',
  'The Ancient Forest', 'Seeds of Tomorrow'
];

const descriptions = [
  'The pixels team who conducted the pixels 2026',
  'Our students getting awards at Avishkar competition',
  'Innov8, a 12-hour hackathon organized under Pixel – the Annual MCA Fest at SIESCOMS',
  'Early decisions form the first strong branches of the work.',
  'Dr. L. S. Swasthimathi (Computer Applications) received the Active SPOC Award for her dedicated contribution to NPTEL.',
  'Small improvements combine into a system that produces lasting value.',
  'Careful attention creates a healthier environment for every idea.',
  'Patience turns repeated effort into knowledge that compounds over time.',
  'A dependable core keeps the wider work balanced and resilient.',
  'Clear structure gives every contribution room to reach its potential.',
  'Focused energy is gathered and transformed into forward motion.',
  'A welcoming space makes room for new voices and unexpected insight.',
  'Pressure reveals the strength built through many earlier choices.',
  'Open communication carries meaning across every part of the team.',
  'Shared progress creates the conditions for new opportunities to grow.',
  'A bold new direction extends the reach of everything built before it.',
  'Many seasons of work become a living record of collective progress.',
  'The next generation inherits a stronger foundation and room to grow.'
];

const categories = [
  'GENESIS', 'VASCULAR', 'MYCELIUM', 'CANOPY',
  'WEATHERING', 'PHOTOSYNTHESIS', 'MICROCLIMATE', 'VASCULAR',
  'HEARTWOOD', 'SYMBIOSIS', 'EQUINOX', 'ECOLOGY',
  'RESILIENCE', 'RESONANCE', 'SUCCESSION', 'SOVEREIGNTY',
  'CONTINUUM', 'ETERNITY'
];

const images = [
  '/images/branches/branch-01.jpeg',
  '/images/branches/Avishkar.jpeg',
  '/images/branches/Innov8.jpeg',
  '/images/branches/sejal.jpeg',
  '/images/branches/swastimati.jpeg',
];

// 18 Anchors strictly in the FOREGROUND (Z is positive: 1.2 to 2.4)
// This guarantees zero collision or occlusion by the trunk/limbs
export const FRONT_ANCHORS: THREE.Vector3[] = [
  // --- FAR LEFT (X: -5.4 to -3.8) ---
  new THREE.Vector3(-5.2, 3.8, 1.4),
  new THREE.Vector3(-4.6, 4.5, 1.2),
  new THREE.Vector3(-4.0, 3.4, 1.6),

  // --- MID LEFT (X: -3.4 to -2.0) ---
  new THREE.Vector3(-3.4, 4.8, 1.3),
  new THREE.Vector3(-2.9, 3.7, 1.7),
  new THREE.Vector3(-2.4, 2.8, 1.9),
  new THREE.Vector3(-2.1, 4.6, 1.3),

  // --- CENTER LEFT (X: -1.6 to -0.6) ---
  new THREE.Vector3(-1.5, 3.8, 2.0),
  new THREE.Vector3(-0.8, 4.9, 1.8),

  // --- CENTER RIGHT (X: +0.6 to +1.6) ---
  new THREE.Vector3(0.8, 4.9, 1.8),
  new THREE.Vector3(1.5, 3.8, 2.0),

  // --- MID RIGHT (X: +2.0 to +3.4) ---
  new THREE.Vector3(2.1, 4.6, 1.3),
  new THREE.Vector3(2.4, 2.8, 1.9),
  new THREE.Vector3(2.9, 3.7, 1.7),
  new THREE.Vector3(3.4, 4.8, 1.3),

  // --- FAR RIGHT (X: +3.8 to +5.4) ---
  new THREE.Vector3(4.0, 3.4, 1.6),
  new THREE.Vector3(4.6, 4.5, 1.2),
  new THREE.Vector3(5.2, 3.8, 1.4),
];

export const branches: BranchStoryData[] = FRONT_ANCHORS.map((anchor, i) => {
  // Staggered cord lengths for natural high/mid/low tiers
  const cordLen = anchor.y > 4.3 ? 0.95 : 1.35;
  const cardPos = new THREE.Vector3(anchor.x, anchor.y - cordLen, anchor.z);

  const startP = 0.71 + (i / 18) * (0.948 - 0.71);
  const endP = 0.71 + ((i + 1) / 18) * (0.948 - 0.71);

  return {
    id: `branch-${i + 1}`,
    index: String(i + 1).padStart(2, "0"),
    subtitle: "A living archive",
    extendedStory: "A moment preserved within the growing canopy.",
    category: categories[i % categories.length],
    year: `YEAR ${Math.round(1 + (i / 17) * 499)}`,
    title: titles[i % titles.length],
    description: descriptions[i % descriptions.length],
    ctaLabel: 'INSPECT SPECIMEN',
    image: images[i % images.length],
    accentColor: '#ffe59e',
    branchAttachment: anchor,
    cardPosition: cardPos,
    cameraApproach: new THREE.Vector3(anchor.x * 1.1, anchor.y + 0.3, anchor.z + 4.5),
    cameraPosition: new THREE.Vector3(anchor.x * 0.95, cardPos.y, anchor.z + 2.8),
    cameraTarget: cardPos,
    rotation: new THREE.Euler(0.02, (i % 2 === 0 ? 0.03 : -0.03), 0.01),
    scrollRange: [startP, endP],
    cordLength: cordLen,
    metadata: {
      coordinates: "51°12'N 0°41'W",
      elevation: `${Math.round(42 + i * 4)}m`,
      specimenId: `QR-${i < 9 ? '0' : ''}${i + 1}`,
      specimen: `QR-${String(i + 1).padStart(2, "0")}`,
      epoch: `Year ${Math.round(1 + (i / 17) * 499)}`,
    }
  };
});

export const finaleCards = branches;