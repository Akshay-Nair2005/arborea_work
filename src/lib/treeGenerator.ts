import * as THREE from 'three';

export interface SprayClusterSpec {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  phase: number;
  birth: number;
  mature: number;
  color: THREE.Color;
}

export interface TreeData {
  barkGeometry: THREE.BufferGeometry;
  sprayClusters: SprayClusterSpec[];
  individualLeaves: SprayClusterSpec[];
  fallenLeaves: SprayClusterSpec[];
}

function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Exact attachment anchors for the 18 posters spread horizontally (Zero overlap with the trunk)
export const POSTER_ANCHORS: THREE.Vector3[] = [
  // FAR LEFT TIER (X: -5.5 to -4.0)
  new THREE.Vector3(-5.4, 3.7, 0.3),
  new THREE.Vector3(-4.8, 4.4, -0.1),
  new THREE.Vector3(-4.2, 3.4, 0.4),

  // MID-LEFT TIER (X: -3.8 to -2.3)
  new THREE.Vector3(-3.7, 4.8, 0.2),
  new THREE.Vector3(-3.2, 3.8, 0.5),
  new THREE.Vector3(-2.8, 2.7, 0.7),
  new THREE.Vector3(-2.4, 4.5, -0.2),

  // INNER-LEFT TIER (X: -1.9 to -1.1)
  new THREE.Vector3(-1.8, 3.9, 0.6),
  new THREE.Vector3(-1.2, 5.1, 0.2),

  // INNER-RIGHT TIER (X: +1.1 to +1.9)
  new THREE.Vector3(1.2, 5.1, 0.2),
  new THREE.Vector3(1.8, 3.9, 0.6),

  // MID-RIGHT TIER (X: +2.3 to +3.8)
  new THREE.Vector3(2.4, 4.5, -0.2),
  new THREE.Vector3(2.8, 2.7, 0.7),
  new THREE.Vector3(3.2, 3.8, 0.5),
  new THREE.Vector3(3.7, 4.8, 0.2),

  // FAR RIGHT TIER (X: +4.0 to +5.5)
  new THREE.Vector3(4.2, 3.4, 0.4),
  new THREE.Vector3(4.8, 4.4, -0.1),
  new THREE.Vector3(5.4, 3.7, 0.3),
];

export function generateProceduralTree(isMobile: boolean): TreeData {
  const rand = createSeededRandom(7919);

  interface TubeBranchSpec {
    points: THREE.Vector3[];
    rStart: number;
    rEnd: number;
    birthStart: number;
    birthEnd: number;
    matureDuration: number;
    pruneAt: number;
    level: number;
    radialSegments: number;
    tubularSegments: number;
  }

  const branches: TubeBranchSpec[] = [];

  // =========================================================================
  // 1. ANCIENT OAK TRUNK (With 6-Lobed Fluted Root Flare)
  // =========================================================================
  branches.push({
    points: [
      new THREE.Vector3(0.0, -0.25, 0.0),
      new THREE.Vector3(0.02, 0.55, -0.01),
      new THREE.Vector3(-0.02, 1.35, 0.02),
      new THREE.Vector3(0.0, 2.15, 0.0),
    ],
    rStart: 1.35,
    rEnd: 0.62,
    birthStart: 0.05,
    birthEnd: 0.42,
    matureDuration: 0.35,
    pruneAt: 0.0,
    level: 0.0,
    radialSegments: 20,
    tubularSegments: 16,
  });

  // =========================================================================
  // 2. SIX MAIN WIDE HORIZONTAL BOUGHS
  // =========================================================================
  // BOUGH 1: Far Left Deep Horizontal Arm
  branches.push({
    points: [
      new THREE.Vector3(0.0, 2.1, 0.0),
      new THREE.Vector3(-1.2, 2.65, 0.15),
      new THREE.Vector3(-2.8, 3.25, 0.3),
      new THREE.Vector3(-4.4, 3.75, 0.2),
      new THREE.Vector3(-5.8, 3.95, 0.0),
    ],
    rStart: 0.58,
    rEnd: 0.18,
    birthStart: 0.24,
    birthEnd: 0.52,
    matureDuration: 0.28,
    pruneAt: 0.0,
    level: 1.0,
    radialSegments: 16,
    tubularSegments: 24,
  });

  // BOUGH 2: Left Upper Arch
  branches.push({
    points: [
      new THREE.Vector3(-1.2, 2.65, 0.15),
      new THREE.Vector3(-1.9, 3.65, -0.15),
      new THREE.Vector3(-2.8, 4.65, -0.15),
      new THREE.Vector3(-4.0, 5.25, -0.05),
    ],
    rStart: 0.44,
    rEnd: 0.15,
    birthStart: 0.28,
    birthEnd: 0.55,
    matureDuration: 0.28,
    pruneAt: 0.0,
    level: 1.0,
    radialSegments: 14,
    tubularSegments: 20,
  });

  // BOUGH 3: Center-Left High Canopy Dome
  branches.push({
    points: [
      new THREE.Vector3(0.0, 2.1, 0.0),
      new THREE.Vector3(-0.4, 3.35, 0.2),
      new THREE.Vector3(-0.8, 4.55, 0.25),
      new THREE.Vector3(-1.4, 5.65, 0.1),
      new THREE.Vector3(-1.9, 6.25, -0.1),
    ],
    rStart: 0.52,
    rEnd: 0.15,
    birthStart: 0.30,
    birthEnd: 0.58,
    matureDuration: 0.28,
    pruneAt: 0.0,
    level: 1.0,
    radialSegments: 14,
    tubularSegments: 24,
  });

  // BOUGH 4: Center-Right High Canopy Dome
  branches.push({
    points: [
      new THREE.Vector3(0.0, 2.1, 0.0),
      new THREE.Vector3(0.4, 3.35, -0.15),
      new THREE.Vector3(0.8, 4.55, -0.15),
      new THREE.Vector3(1.4, 5.65, 0.1),
      new THREE.Vector3(1.9, 6.25, 0.05),
    ],
    rStart: 0.52,
    rEnd: 0.15,
    birthStart: 0.30,
    birthEnd: 0.58,
    matureDuration: 0.28,
    pruneAt: 0.0,
    level: 1.0,
    radialSegments: 14,
    tubularSegments: 24,
  });

  // BOUGH 5: Right Upper Arch
  branches.push({
    points: [
      new THREE.Vector3(1.2, 2.65, -0.15),
      new THREE.Vector3(1.9, 3.65, 0.15),
      new THREE.Vector3(2.8, 4.65, 0.15),
      new THREE.Vector3(4.0, 5.25, 0.05),
    ],
    rStart: 0.44,
    rEnd: 0.15,
    birthStart: 0.28,
    birthEnd: 0.55,
    matureDuration: 0.28,
    pruneAt: 0.0,
    level: 1.0,
    radialSegments: 14,
    tubularSegments: 20,
  });

  // BOUGH 6: Far Right Deep Horizontal Arm
  branches.push({
    points: [
      new THREE.Vector3(0.0, 2.1, 0.0),
      new THREE.Vector3(1.2, 2.65, -0.15),
      new THREE.Vector3(2.8, 3.25, -0.3),
      new THREE.Vector3(4.4, 3.75, -0.2),
      new THREE.Vector3(5.8, 3.95, 0.0),
    ],
    rStart: 0.58,
    rEnd: 0.18,
    birthStart: 0.24,
    birthEnd: 0.52,
    matureDuration: 0.28,
    pruneAt: 0.0,
    level: 1.0,
    radialSegments: 16,
    tubularSegments: 24,
  });

  // =========================================================================
  // 3. SPREADING SURFACE BUTTRESS ROOTS
  // =========================================================================
  const rootSpecs = [
    [new THREE.Vector3(-0.4, 0.6, 0.2), new THREE.Vector3(-1.1, 0.15, 0.6), new THREE.Vector3(-2.2, -0.15, 1.1)],
    [new THREE.Vector3(0.4, 0.6, 0.3), new THREE.Vector3(1.2, 0.15, 0.7), new THREE.Vector3(2.3, -0.15, 1.2)],
    [new THREE.Vector3(-0.3, 0.5, -0.3), new THREE.Vector3(-0.9, 0.12, -0.9), new THREE.Vector3(-1.9, -0.18, -1.5)],
    [new THREE.Vector3(0.3, 0.5, -0.3), new THREE.Vector3(1.0, 0.12, -0.8), new THREE.Vector3(2.0, -0.18, -1.4)],
  ];

  rootSpecs.forEach((pts) => {
    branches.push({
      points: pts,
      rStart: 0.44,
      rEnd: 0.08,
      birthStart: 0.22,
      birthEnd: 0.48,
      matureDuration: 0.26,
      pruneAt: 0.0,
      level: 0.3,
      radialSegments: 12,
      tubularSegments: 14,
    });
  });

  // =========================================================================
  // 4. JUVENILE STEM SHOOTS (Stage 02 early shoots that self-prune in Stage 03)
  // =========================================================================
  for (let j = 0; j < 6; j++) {
    const yStem = 0.65 + j * 0.28;
    const ang = j * 2.4;
    branches.push({
      points: [
        new THREE.Vector3(Math.cos(ang) * 0.3, yStem, Math.sin(ang) * 0.3),
        new THREE.Vector3(Math.cos(ang) * 0.75, yStem + 0.12, Math.sin(ang) * 0.75),
        new THREE.Vector3(Math.cos(ang) * 1.1, yStem + 0.2, Math.sin(ang) * 1.1),
      ],
      rStart: 0.065,
      rEnd: 0.015,
      birthStart: 0.12 + j * 0.025,
      birthEnd: 0.26 + j * 0.025,
      matureDuration: 0.14,
      pruneAt: 0.46, // Naturally self-prunes when trunk thickens
      level: 1.8,
      radialSegments: 8,
      tubularSegments: 10,
    });
  }

  // =========================================================================
  // 5. EIGHTEEN DISTINCT HORIZONTAL SUB-TWIGS CONNECTING TO EACH POSTER
  // =========================================================================
  POSTER_ANCHORS.forEach((target, i) => {
    // Find closest main bough point to branch from
    const fromX = target.x * 0.72;
    const fromY = target.y + 0.32;
    const fromZ = target.z * 0.65;

    branches.push({
      points: [
        new THREE.Vector3(fromX, fromY, fromZ),
        new THREE.Vector3((fromX + target.x) * 0.5, (fromY + target.y) * 0.5 + 0.08, (fromZ + target.z) * 0.5),
        new THREE.Vector3(target.x, target.y, target.z),
      ],
      rStart: 0.16,
      rEnd: 0.05,
      birthStart: 0.38 + (i % 6) * 0.03,
      birthEnd: 0.62,
      matureDuration: 0.22,
      pruneAt: 0.0,
      level: 2.0,
      radialSegments: 8,
      tubularSegments: 10,
    });
  });

  // =========================================================================
  // 6. BUILD UNIFIED GPU BARK GEOMETRY WITH SHADER ATTRIBUTES
  // =========================================================================
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const spinePos: number[] = [];
  const aBirth: number[] = [];
  const aMature: number[] = [];
  const aPrune: number[] = [];
  const aLevel: number[] = [];
  const aPathT: number[] = [];
  const indices: number[] = [];
  let indexOffset = 0;

  branches.forEach((spec) => {
    const curve = new THREE.CatmullRomCurve3(spec.points);
    const geom = new THREE.TubeGeometry(curve, spec.tubularSegments, spec.rStart, spec.radialSegments, false);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = Math.floor(i / (spec.radialSegments + 1)) / spec.tubularSegments;
      const taper = THREE.MathUtils.lerp(1.0, spec.rEnd / spec.rStart, v);
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);

      let flute = 1.0;
      if (spec.level === 0.0 && vy < 1.0) {
        const angle = Math.atan2(vz, vx);
        flute = 1.0 + Math.sin(angle * 6.0) * 0.18 * Math.max(0, 1.0 - vy);
      }

      pos.setX(i, vx * taper * flute);
      pos.setZ(i, vz * taper * flute);
    }
    geom.computeVertexNormals();

    const pArr = geom.attributes.position.array as Float32Array;
    const nArr = geom.attributes.normal.array as Float32Array;
    const uArr = geom.attributes.uv.array as Float32Array;
    const idxArr = geom.index!.array;

    for (let i = 0; i < pArr.length; i += 3) {
      const vx = pArr[i];
      const vy = pArr[i + 1];
      const vz = pArr[i + 2];

      const v =
        Math.floor((i / 3) / (spec.radialSegments + 1)) /
        spec.tubularSegments;

      positions.push(vx, vy, vz);
      normals.push(nArr[i], nArr[i + 1], nArr[i + 2]);
      uvs.push(uArr[(i / 3) * 2], uArr[(i / 3) * 2 + 1]);

      const isSunlit = nArr[i + 1] > 0.35;
      if (isSunlit) {
        colors.push(0.55, 0.44, 0.34);
      } else {
        colors.push(0.22, 0.15, 0.10);
      }

      spinePos.push(vx * 0.18, vy, vz * 0.18);
      aBirth.push(spec.birthStart);
      aMature.push(spec.birthEnd);
      aPrune.push(spec.pruneAt);
      aLevel.push(spec.level);
      aPathT.push(v);
    }

    for (let i = 0; i < idxArr.length; i++) {
      indices.push(idxArr[i] + indexOffset);
    }
    indexOffset += geom.attributes.position.count;
  });

  const barkGeometry = new THREE.BufferGeometry();
  barkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  barkGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  barkGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  barkGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  barkGeometry.setAttribute('aSpinePos', new THREE.Float32BufferAttribute(spinePos, 3));
  barkGeometry.setAttribute('aBirth', new THREE.Float32BufferAttribute(aBirth, 1));
  barkGeometry.setAttribute('aMature', new THREE.Float32BufferAttribute(aMature, 1));
  barkGeometry.setAttribute('aPrune', new THREE.Float32BufferAttribute(aPrune, 1));
  barkGeometry.setAttribute('aLevel', new THREE.Float32BufferAttribute(aLevel, 1));
  barkGeometry.setAttribute('aPathT', new THREE.Float32BufferAttribute(aPathT, 1));
  barkGeometry.setIndex(indices);

  // =========================================================================
  // 7. SPARSE FOLIAGE SPRAYS ON OUTER PERIMETER ONLY (LEAVES CENTER CLEAR)
  // =========================================================================
  const sprayClusters: SprayClusterSpec[] = [];
  const sprayCount = isMobile ? 760 : 1800;
  const leafPalette = [
    new THREE.Color('#4d7a36'),
    new THREE.Color('#5f9443'),
    new THREE.Color('#75ac55'),
    new THREE.Color('#8bc26a'),
    new THREE.Color('#9fd67c'),
  ];

  for (let i = 0; i < sprayCount; i++) {
    const angle = rand() * Math.PI * 2;
    // Pushed outward: 2.2m to 6.4m radius (leaves center open)
    const radius = 0.75 + Math.pow(rand(), 0.70) * 5.65;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 0.64 - 0.28;
    const arch = Math.sin(Math.min(Math.PI, (radius / 6.4) * Math.PI));
    const y = 3.55 + arch * 2.55 + (rand() - 0.5) * 1.05;

    // Keep the near-front card plane clear for readable photographs.
    if (z > 0.65 && y < 5.0 && Math.abs(x) < 5.65) continue;
    sprayClusters.push({
      position: new THREE.Vector3(x, y, z),
      rotation: new THREE.Euler((rand() - 0.5) * 0.5, rand() * Math.PI * 2, (rand() - 0.5) * 0.5),
      scale: 0.32 + rand() * 0.22,
      phase: rand() * Math.PI * 2,
      birth: 0.28 + rand() * 0.22,
      mature: 0.62,
      color: leafPalette[Math.floor(rand() * leafPalette.length)],
    });
  }

  // Individual sculpted leaves
  const individualLeaves: SprayClusterSpec[] = [];
  for (let i = 0; i < (isMobile ? 340 : 900); i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 0.85 + rand() * 5.35;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 0.65 - 0.22;
    const y = 3.2 + (rand() - 0.5) * 2.4;

    if (z > 0.65 && y < 5.0 && Math.abs(x) < 5.65) continue;
    individualLeaves.push({
      position: new THREE.Vector3(x, y, z),
      rotation: new THREE.Euler(rand() * 0.4, rand() * Math.PI * 2, rand() * 0.4),
      scale: 0.16 + rand() * 0.14,
      phase: rand() * Math.PI * 2,
      birth: 0.24 + rand() * 0.22,
      mature: 0.58,
      color: leafPalette[Math.floor(rand() * leafPalette.length)],
    });
  }

  // Fallen ground leaves around root base
  const fallenLeaves: SprayClusterSpec[] = [];
  for (let i = 0; i < 90; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 0.8 + rand() * 3.4;
    fallenLeaves.push({
      position: new THREE.Vector3(Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius),
      rotation: new THREE.Euler(Math.PI / 2 + (rand() - 0.5) * 0.2, 0, rand() * Math.PI * 2),
      scale: 0.14 + rand() * 0.12,
      phase: 0,
      birth: 0.1,
      mature: 0.3,
      color: new THREE.Color(rand() > 0.5 ? '#614828' : '#7d5e31'),
    });
  }

  return { barkGeometry, sprayClusters, individualLeaves, fallenLeaves };
}