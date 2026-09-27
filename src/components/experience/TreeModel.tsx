'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ScrollStateRef } from '@/hooks/useScrollProgress';
import { computeTimelineSnapshot } from '@/hooks/useExperienceTimeline';
import { generateProceduralTree } from '@/lib/treeGenerator';
import { getBotanicalTextures } from '@/lib/botanicalTextures';
import { applyBarkGrowthShader, BarkShaderUniforms } from '@/shaders/treeShaders';

interface TreeModelProps {
  scrollRef: React.MutableRefObject<ScrollStateRef>;
  isMobile: boolean;
  reducedMotion: boolean;
}

function createCurvedOakLeafGeometry(): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(0.72, 1.0, 6, 8);
  geom.translate(0, 0.5, 0);
  geom.rotateY(Math.PI);

  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const archZ = Math.sin(y * Math.PI) * 0.11 - Math.abs(x) * 0.15 + Math.sin(y * 9.0 + x * 6.0) * 0.016;
    pos.setZ(i, archZ);
  }
  geom.computeVertexNormals();
  return geom;
}

function createVolumetricSprayGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const angles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  angles.forEach((ang, idx) => {
    const plane = new THREE.PlaneGeometry(1.12, 1.12, 4, 4);
    plane.translate(0, 0.50, 0);
    plane.rotateY(Math.PI);
    const pos = plane.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const zCurve = Math.sin(y * Math.PI) * 0.15 - Math.abs(x) * 0.13;
      pos.setZ(i, zCurve);
    }
    plane.rotateX(0.32 + idx * 0.08);
    plane.rotateY(ang);
    plane.computeVertexNormals();
    geometries.push(plane);
  });

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let offset = 0;

  for (const g of geometries) {
    const p = g.attributes.position.array as Float32Array;
    const n = g.attributes.normal.array as Float32Array;
    const u = g.attributes.uv.array as Float32Array;
    const idxArr = g.index!.array;

    for (let i = 0; i < p.length; i++) positions.push(p[i]);
    for (let i = 0; i < n.length; i++) normals.push(n[i]);
    for (let i = 0; i < u.length; i++) uvs.push(u[i]);
    for (let i = 0; i < idxArr.length; i++) indices.push(idxArr[i] + offset);

    offset += g.attributes.position.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  merged.setIndex(indices);
  return merged;
}

export function TreeModel({ scrollRef, isMobile, reducedMotion }: TreeModelProps) {
  const treeData = useMemo(() => generateProceduralTree(isMobile), [isMobile]);
  const singleLeafGeo = useMemo(() => createCurvedOakLeafGeometry(), []);
  const sprayClusterGeo = useMemo(() => createVolumetricSprayGeometry(), []);
  const botanicalTextures = useMemo(() => getBotanicalTextures(), []);

  const barkTexture = useTexture('/textures/oak-bark.jpg');
  useMemo(() => {
    barkTexture.wrapS = THREE.RepeatWrapping;
    barkTexture.wrapT = THREE.RepeatWrapping;
    barkTexture.repeat.set(3, 8);
    barkTexture.colorSpace = THREE.SRGBColorSpace;
    barkTexture.anisotropy = 8;
  }, [barkTexture]);

  // STAGE 01 BOTANICAL SEEDLING
  const { saplingStemGeo, radicleRootGeo, petioleGeo } = useMemo(() => {
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, -0.015, 0.0),
      new THREE.Vector3(0.004, 0.065, 0.003),
      new THREE.Vector3(-0.005, 0.145, -0.002),
      new THREE.Vector3(0.002, 0.225, 0.002),
      new THREE.Vector3(0.0, 0.285, 0.0),
    ]);
    const stem = new THREE.TubeGeometry(stemCurve, 24, 0.0042, 10, false);
    const sPos = stem.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const y = sPos.getY(i);
      const t = THREE.MathUtils.clamp(y / 0.285, 0, 1);
      const taper = 1.15 - t * 0.45;
      sPos.setX(i, sPos.getX(i) * taper);
      sPos.setZ(i, sPos.getZ(i) * taper);
    }
    stem.computeVertexNormals();

    const rootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.008, 0.012, 0.004),
      new THREE.Vector3(0.015, 0.004, 0.018),
      new THREE.Vector3(0.038, -0.008, 0.028),
      new THREE.Vector3(0.065, -0.025, 0.035),
    ]);
    const root = new THREE.TubeGeometry(rootCurve, 12, 0.0026, 6, false);

    const petCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.12, 0.03),
      new THREE.Vector3(0, 0.24, 0.07),
    ]);
    const pet = new THREE.TubeGeometry(petCurve, 8, 0.014, 6, false);

    return { saplingStemGeo: stem, radicleRootGeo: root, petioleGeo: pet };
  }, []);

  const saplingGroupRef = useRef<THREE.Group>(null);
  const saplingLightRef = useRef<THREE.PointLight>(null);
  const saplingLeavesRef = useRef<(THREE.Group | null)[]>([]);

  const sprayMeshRef = useRef<THREE.InstancedMesh>(null);
  const leafMeshRef = useRef<THREE.InstancedMesh>(null);
  const fairyLightsMeshRef = useRef<THREE.InstancedMesh>(null);
  const fallingLeavesRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const fallingLeafSeeds = useMemo(() => {
    const count = isMobile ? 10 : 22;
    return Array.from({ length: count }, (_, i) => ({
      phase: (i * 2.417) % (Math.PI * 2),
      speed: 0.18 + ((i * 0.071) % 0.16),
      x: -5.4 + ((i * 1.73) % 10.8),
      z: -1.4 + ((i * 0.91) % 3.2),
      y: 4.2 + ((i * 1.31) % 3.0),
      size: 0.075 + ((i * 0.037) % 0.055),
    }));
  }, [isMobile]);

  // Fairy lights along branches
  const fairyLightPositions = useMemo(() => {
    const list: { pos: THREE.Vector3; scale: number; phase: number }[] = [];
    const count = isMobile ? 48 : 88;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.2 + Math.abs(Math.sin(i * 1.8)) * 4.6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.75;
      const y = 2.2 + Math.abs(Math.cos(i * 2.2)) * 3.6;
      list.push({
        pos: new THREE.Vector3(x, y, z),
        scale: 0.036 + (i % 3) * 0.014,
        phase: i * 0.45,
      });
    }

    // Base root fairy lights
    for (let r = 0; r < 20; r++) {
      const a = (r / 20) * Math.PI * 2;
      const rad = 1.1 + (r % 3) * 0.45;
      list.push({
        pos: new THREE.Vector3(Math.cos(a) * rad, 0.14 + (r % 2) * 0.08, Math.sin(a) * rad),
        scale: 0.032,
        phase: r * 0.8,
      });
    }
    return list;
  }, [isMobile]);

  const barkUniforms = useMemo<BarkShaderUniforms>(
    () => ({
      uGrowth: { value: 0.01 },
      uTime: { value: 0 },
      uWindStrength: { value: 1.0 },
      uFinaleGlow: { value: 0.0 },
    }),
    []
  );

  const barkMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: barkTexture,
      bumpMap: barkTexture,
      bumpScale: 0.16,
      vertexColors: true,
      roughness: 0.86,
      metalness: 0.06,
      emissive: new THREE.Color('#1f160e'),
      emissiveIntensity: 0.22,
    });
    mat.onBeforeCompile = (shader) => applyBarkGrowthShader(shader, barkUniforms);
    return mat;
  }, [barkTexture, barkUniforms]);

  const barkDepthMaterial = useMemo(() => {
    const mat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
    });
    mat.onBeforeCompile = (shader) => applyBarkGrowthShader(shader, barkUniforms);
    return mat;
  }, [barkUniforms]);

  useEffect(() => {
    if (sprayMeshRef.current) {
      treeData.sprayClusters.forEach((item, i) => {
        sprayMeshRef.current!.setColorAt(i, item.color);
      });
      if (sprayMeshRef.current.instanceColor) {
        sprayMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
    if (leafMeshRef.current) {
      treeData.individualLeaves.forEach((item, i) => {
        leafMeshRef.current!.setColorAt(i, item.color);
      });
      if (leafMeshRef.current.instanceColor) {
        leafMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [treeData]);

  const saplingLeafConfigs = useMemo(
    () => [
      { y: 0.095, rotY: 0.72, tiltX: 0.96, rollZ: 0.22, baseScale: 0.105, birth: 0.0 },
      { y: 0.118, rotY: -0.78, tiltX: 0.94, rollZ: -0.22, baseScale: 0.112, birth: 0.0 },
      { y: 0.168, rotY: 1.28, tiltX: 0.86, rollZ: 0.28, baseScale: 0.132, birth: 0.0 },
      { y: 0.192, rotY: -1.32, tiltX: 0.84, rollZ: -0.28, baseScale: 0.128, birth: 0.0 },
      { y: 0.248, rotY: 0.48, tiltX: 0.78, rollZ: 0.18, baseScale: 0.142, birth: 0.0 },
      { y: 0.258, rotY: -0.52, tiltX: 0.80, rollZ: -0.18, baseScale: 0.138, birth: 0.01 },
      { y: 0.268, rotY: 2.85, tiltX: 0.84, rollZ: 0.15, baseScale: 0.118, birth: 0.02 },
    ],
    []
  );

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const s = scrollRef.current;
    const snap = computeTimelineSnapshot(s.smoothProgress, s.velocity);

    const effectiveGrowth = snap.treeGrowth;
    const windFactor = reducedMotion ? 0.12 : 0.72;

    barkUniforms.uGrowth.value = effectiveGrowth;
    barkUniforms.uTime.value = elapsed;
    barkUniforms.uWindStrength.value = windFactor;
    barkUniforms.uFinaleGlow.value = snap.finaleFactor;

    // Stage 01 seedling
    if (saplingGroupRef.current) {
      saplingGroupRef.current.visible = s.smoothProgress < 0.23;
      const saplingGrowth = THREE.MathUtils.clamp(s.smoothProgress / 0.22, 0, 1);
      const gentleBreeze = Math.sin(elapsed * 1.35) * 0.018 * windFactor;
      saplingGroupRef.current.rotation.z = gentleBreeze;
      saplingGroupRef.current.rotation.x = Math.cos(elapsed * 1.05) * 0.012 * windFactor;

      const stemStretchY = 1.0 + saplingGrowth * 1.85;
      const stemThickXZ = 1.0 + saplingGrowth * 1.4;
      saplingGroupRef.current.scale.set(stemThickXZ, stemStretchY, stemThickXZ);

      if (saplingLightRef.current) {
        saplingLightRef.current.intensity = (1.0 - THREE.MathUtils.smoothstep(s.smoothProgress, 0.14, 0.35)) * 2.2;
      }

      saplingLeafConfigs.forEach((cfg, idx) => {
        const pitchGrp = saplingLeavesRef.current[idx];
        if (!pitchGrp) return;
        const leafUnfurl = THREE.MathUtils.smoothstep(s.smoothProgress, cfg.birth, cfg.birth + 0.12);
        const flutter = Math.sin(elapsed * 2.1 + idx * 1.4) * 0.038 * windFactor;
        pitchGrp.rotation.set(cfg.tiltX + flutter, 0, cfg.rollZ + flutter * 0.45);
        pitchGrp.scale.setScalar(cfg.baseScale * (0.86 + leafUnfurl * 0.35));
      });
    }

    // Fairy string lights in Stage 04–06
    if (fairyLightsMeshRef.current) {
      const lightsReveal = THREE.MathUtils.smoothstep(effectiveGrowth, 0.45, 0.85);
      fairyLightsMeshRef.current.visible = lightsReveal > 0.01;

      if (lightsReveal > 0.01) {
        fairyLightPositions.forEach((fl, idx) => {
          const twinkle = 0.85 + Math.sin(elapsed * 2.6 + fl.phase) * 0.25;
          dummy.position.copy(fl.pos);
          dummy.scale.setScalar(fl.scale * lightsReveal * twinkle);
          dummy.updateMatrix();
          fairyLightsMeshRef.current!.setMatrixAt(idx, dummy.matrix);
        });
        fairyLightsMeshRef.current.instanceMatrix.needsUpdate = true;
      }
    }

    // Foliage sprays
    if (sprayMeshRef.current) {
      const sprays = treeData.sprayClusters;
      for (let i = 0; i < sprays.length; i++) {
        const sp = sprays[i];
        if (effectiveGrowth <= sp.birth) {
          dummy.position.set(0, -100, 0);
          dummy.scale.setScalar(0.0001);
          dummy.updateMatrix();
          sprayMeshRef.current.setMatrixAt(i, dummy.matrix);
          continue;
        }

        const t = THREE.MathUtils.clamp((effectiveGrowth - sp.birth) / Math.max(0.001, sp.mature - sp.birth), 0, 1);
        const easeScale = 1 - Math.pow(1 - t, 3);
        const breeze = Math.sin(elapsed * 1.45 + sp.phase) * 0.035 * windFactor;

        dummy.position.set(sp.position.x, sp.position.y, sp.position.z);
        dummy.rotation.set(sp.rotation.x + breeze, sp.rotation.y + breeze * 0.5, sp.rotation.z + breeze * 0.7);
        dummy.scale.setScalar(sp.scale * easeScale);
        dummy.updateMatrix();
        sprayMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      sprayMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Close-up individual leaves
    if (leafMeshRef.current) {
      const leaves = treeData.individualLeaves;
      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];
        if (effectiveGrowth <= leaf.birth) {
          dummy.position.set(0, -100, 0);
          dummy.scale.setScalar(0.0001);
          dummy.updateMatrix();
          leafMeshRef.current.setMatrixAt(i, dummy.matrix);
          continue;
        }

        const t = THREE.MathUtils.clamp((effectiveGrowth - leaf.birth) / Math.max(0.001, leaf.mature - leaf.birth), 0, 1);
        const easeScale = 1 - Math.pow(1 - t, 3);
        const flutter = Math.sin(elapsed * 1.85 + leaf.phase) * 0.045 * windFactor;

        dummy.position.set(leaf.position.x, leaf.position.y, leaf.position.z);
        dummy.rotation.set(leaf.rotation.x + flutter, leaf.rotation.y + flutter * 0.5, leaf.rotation.z + flutter * 0.7);
        dummy.scale.setScalar(leaf.scale * easeScale);
        dummy.updateMatrix();
        leafMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      leafMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // A small number of individual leaves drift down from the mature canopy.
    // The motion is deterministic but phase-shifted so it feels random without
    // creating per-frame object allocation or React work.
    if (fallingLeavesRef.current) {
      const fallingEnabled = effectiveGrowth > 0.46 && !reducedMotion;
      for (let i = 0; i < fallingLeafSeeds.length; i++) {
        const seed = fallingLeafSeeds[i];
        if (!fallingEnabled) {
          dummy.position.set(0, -100, 0);
          dummy.scale.setScalar(0.0001);
          dummy.updateMatrix();
          fallingLeavesRef.current.setMatrixAt(i, dummy.matrix);
          continue;
        }

        const cycle = 6.0 + (i % 5) * 1.15;
        const local = ((elapsed + seed.phase * 1.7) % cycle) / cycle;
        const fallT = THREE.MathUtils.smoothstep(local, 0.04, 0.94);
        const y = seed.y - fallT * 5.0;
        const x = seed.x + Math.sin(elapsed * 0.55 + seed.phase) * 0.34 + Math.sin(elapsed * 0.23 + i) * 0.18;
        const z = seed.z + Math.cos(elapsed * 0.43 + seed.phase) * 0.24;
        const fadeIn = THREE.MathUtils.smoothstep(local, 0.02, 0.10);
        const fadeOut = 1.0 - THREE.MathUtils.smoothstep(local, 0.78, 0.98);
        const visibility = fadeIn * fadeOut;

        dummy.position.set(x, y, z);
        dummy.rotation.set(
          elapsed * 0.45 + seed.phase,
          elapsed * 0.31 + seed.phase * 0.7,
          elapsed * 0.62 + seed.phase * 1.3
        );
        dummy.scale.setScalar(seed.size * visibility);
        dummy.updateMatrix();
        fallingLeavesRef.current.setMatrixAt(i, dummy.matrix);
      }
      fallingLeavesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group name="living-ancient-oak-world">
      {/* STAGE 01 BOTANICAL SEEDLING */}
      <group ref={saplingGroupRef} position={[0, 0, 0]}>
        <pointLight
          ref={saplingLightRef}
          position={[0.18, 0.58, 0.42]}
          color="#fff4d2"
          intensity={2.2}
          distance={2.4}
        />
        <mesh position={[-0.016, 0.010, 0.010]} rotation={[0.18, 0.42, 0.28]} scale={[1.45, 0.82, 0.86]} castShadow receiveShadow>
          <sphereGeometry args={[0.019, 20, 16]} />
          <meshStandardMaterial map={barkTexture} color="#6e4928" roughness={0.58} metalness={0.05} />
        </mesh>
        <mesh position={[-0.036, 0.011, 0.004]} rotation={[0.35, -0.5, 1.1]} scale={[1.0, 0.65, 1.0]} castShadow>
          <sphereGeometry args={[0.017, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial map={barkTexture} color="#473320" roughness={0.90} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={radicleRootGeo}>
          <meshStandardMaterial map={barkTexture} color="#7a5b38" roughness={0.85} />
        </mesh>
        <mesh geometry={radicleRootGeo} rotation={[0, 2.2, 0]} scale={[0.8, 0.9, 0.8]}>
          <meshStandardMaterial map={barkTexture} color="#6b4e2f" roughness={0.85} />
        </mesh>
        <mesh geometry={saplingStemGeo} castShadow receiveShadow>
          <meshStandardMaterial map={barkTexture} color="#5c7538" roughness={0.68} metalness={0.02} />
        </mesh>
        <mesh position={[0, 0.286, 0]} scale={[0.65, 1.45, 0.65]}>
          <coneGeometry args={[0.0042, 0.014, 8]} />
          <meshStandardMaterial color="#6e7d38" roughness={0.62} />
        </mesh>

        {saplingLeafConfigs.map((cfg, idx) => (
          <group key={idx} position={[0, cfg.y, 0]} rotation={[0, cfg.rotY, 0]}>
            <group ref={(el) => { saplingLeavesRef.current[idx] = el; }} scale={[cfg.baseScale, cfg.baseScale, cfg.baseScale]}>
              <mesh geometry={petioleGeo}>
                <meshStandardMaterial color="#6b873e" roughness={0.62} />
              </mesh>
              <mesh geometry={singleLeafGeo} position={[0, 0.22, 0.06]} rotation={[0.16, 0, 0]} castShadow receiveShadow>
                <meshStandardMaterial
                  map={botanicalTextures.leafColorMap}
                  normalMap={botanicalTextures.leafNormalMap}
                  normalScale={new THREE.Vector2(0.95, 0.95)}
                  alphaTest={0.38}
                  roughness={0.44}
                  metalness={0.04}
                  color={idx >= 4 ? '#d8f0b0' : '#c6e39d'}
                  emissive="#1e3812"
                  emissiveIntensity={0.28}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* Low-Angle Bark Raking Lights */}
      <directionalLight position={[4.5, 2.5, 7.5]} color="#ffe8be" intensity={2.4} />
      <directionalLight position={[-5.0, 2.0, 6.0]} color="#b5cb9e" intensity={1.2} />

      {/* UNIFIED ANCIENT OAK TRUNK */}
      <mesh
        geometry={treeData.barkGeometry}
        material={barkMaterial}
        customDepthMaterial={barkDepthMaterial}
        frustumCulled={false}
        castShadow
        receiveShadow
      />

      {/* FAIRY STRING LIGHT BULBS */}
      <instancedMesh
        ref={fairyLightsMeshRef}
        args={[undefined, undefined, fairyLightPositions.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color="#ffe59e" />
      </instancedMesh>

      {/* VOLUMETRIC OAK SPRAY CANOPY */}
      <instancedMesh
        ref={sprayMeshRef}
        args={[sprayClusterGeo, undefined, treeData.sprayClusters.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          map={botanicalTextures.sprayColorMap}
          normalMap={botanicalTextures.sprayNormalMap}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          alphaTest={0.36}
          color="#9ed47a"
          roughness={0.48}
          metalness={0.04}
          emissive="#162e0d"
          emissiveIntensity={0.28}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* INDIVIDUAL SCULPTED LEAVES */}
      <instancedMesh
        ref={leafMeshRef}
        args={[singleLeafGeo, undefined, treeData.individualLeaves.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          map={botanicalTextures.leafColorMap}
          normalMap={botanicalTextures.leafNormalMap}
          normalScale={new THREE.Vector2(0.9, 0.9)}
          alphaTest={0.38}
          color="#a2db7e"
          roughness={0.42}
          metalness={0.04}
          emissive="#162e0d"
          emissiveIntensity={0.28}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Sparse natural leaf fall — intentionally subtle. */}
      <instancedMesh
        ref={fallingLeavesRef}
        args={[singleLeafGeo, undefined, fallingLeafSeeds.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          map={botanicalTextures.leafColorMap}
          alphaTest={0.32}
          color="#8ebf63"
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}