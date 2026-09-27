# 02 — PROJECT WALKTHROUGH & SYSTEM ARCHITECTURE

This document provides a complete, human-readable engineering walkthrough of **ARBOREA (`immersive-3d-tree-growth`)**. A developer who has never seen this codebase can read this file from top to bottom to understand how every visual, mathematical, and interactive subsystem operates.

---

## 1. PROJECT OVERVIEW

### Project Purpose & Core Concept
ARBOREA is an interactive 3D WebGL archival experience that transforms vertical page scrolling into biological time and spatial camera movement. Rather than placing a static 3D model inside a webpage section, the entire viewport is a single continuous 3D forest clearing (`<TreeScene />`) where a solitary **Ancient English Oak (*Quercus robur*)** germinates from an acorn at microscopic scale, grows into a monumental centuries-old tree, reveals five physical 3D hanging archival story cards suspended from its boughs, and concludes with a radiant ultra-wide full-tree reveal.

### Target Experience & User Journey
1. **Intimate Beginning (`0%–18%`):** The user starts centimetres from damp forest humus, inspecting a germinating oak acorn and a 7-leaf botanical seedling.
2. **Biological Acceleration (`18%–71%`):** As the user scrolls, the camera pulls backward and upward along a smooth 3D spline while the seedling thickens into a woody stem, sprouts juvenile lateral shoots, self-prunes its lower juvenile shoots as the main bole swells to over 2 metres in diameter, forks into heavy co-dominant trunks, and unfurls thousands of oak leaves into an asymmetric dome canopy.
3. **Canopy Exploration (`71%–94.8%`):** Once the full tree is revealed, scrolling guides the camera into the canopy, orbiting from branch to branch to inspect five physical 3D museum frames hanging from brass cords.
4. **Monumental Finale (`94.8%–100%`):** The camera pulls back to an ultra-wide vantage point (`z = 21.2m`), bathing the complete Ancient Oak in golden-hour sunlight and volumetric sunbeams with the closing statement *"Everything Starts Small."*

### Technology Stack
- **Application Framework:** Next.js `14.2.16` (App Router, static prerendering, client-side dynamic WebGL import with `ssr: false`)
- **UI Runtime:** React `18.3.1` & React DOM `18.3.1`
- **Language:** TypeScript `5.6.3` (strict mode)
- **3D Engine:** Three.js `^0.169.0`
- **React 3D Renderer:** `@react-three/fiber` `^8.17.10`
- **WebGL Helpers:** `@react-three/drei` `^9.114.0` (`useTexture`)
- **Post-Processing:** `@react-three/postprocessing` `^2.16.3` & `postprocessing` `^6.36.3` (`EffectComposer`, `Bloom`, `Vignette`)
- **Styling & Icons:** Tailwind CSS `^3.4.14`, `lucide-react` `^0.454.0`, Google Fonts (`Cormorant Garamond`, `Plus Jakarta Sans`, `JetBrains Mono`)
- **Audio:** Native browser Web Audio API (`AudioContext` procedural synthesis)

### High-Level Architecture & Major Components
The codebase separates **60fps WebGL mutation** from **throttled ~20Hz React UI state**:
- `src/app/page.tsx`: Root scroll container (`min-h-[1150vh]`), keyboard listener, and layout orchestrator.
- `src/hooks/useScrollProgress.ts`: Captures raw window scroll & pointer coordinates into a mutable ref (`scrollRef`) updated every `requestAnimationFrame` with exponential damping, while throttling React state updates (`uiProgress`, `uiVelocity`) to once every `48ms`.
- `src/hooks/useExperienceTimeline.ts`: Pure mathematical state machine (`computeTimelineSnapshot`) shared by both Three.js `useFrame` hooks and React HUD components.
- `src/components/experience/*`: Three.js scene graph components (`TreeScene`, `CameraController`, `Environment`, `TreeGrowth`, `TreeModel`, `BranchExplorer`, `HangingCard`, `ParticleSystem`).
- `src/lib/*` & `src/shaders/*`: Deterministic geometry generation (`treeGenerator.ts`), procedural Canvas2D leaf/spray texture generation (`botanicalTextures.ts`), GLSL bark growth shader injection (`treeShaders.ts`), and Web Audio synthesizer (`audioEngine.ts`).
- `src/components/ui/*`: Fixed HUD overlays (`Navigation`, `ProgressIndicator`, `BranchIndicator`).

---

## 2. USER EXPERIENCE WALKTHROUGH

```
ENTRY (0%)
 ↓
STAGE 01: SAPLING (0.00 – 0.18)
 ↓
STAGE 02: DEVELOPING STEM (0.18 – 0.36)
 ↓
STAGE 03: YOUNG TREE (0.36 – 0.54)
 ↓
STAGE 04: FULL TREE (0.54 – 0.71)
 ↓
STAGE 05: BRANCH EXPLORATION (0.71 – 0.948)
   ├── BRANCH_APPROACH (localT 0.00 – 0.25 on Branch 01)
   ├── BRANCH_CARD     (localT 0.25 – 0.84 on Active Branch)
   └── NEXT_BRANCH     (localT 0.84 – 1.00 / 0.00 – 0.25 on Branches 02–05)
 ↓
FINALE: FULL_TREE_FINALE (0.948 – 1.00)
```

### Stage-by-Stage Breakdown

#### 1. ENTRY & STAGE 01 — SAPLING (`scrollProgress: 0.00 – 0.18`)
- **What the user sees:** An intimate macro view of dark forest humus (`public/textures/forest-soil.jpg`), 3D soil clods and moss cushions, floating microscopic spores, a weathered germinating oak acorn nut with its detached scaly cupule cap, emerging radicle roots, and a slender olive-woody seedling stem bearing 7 veined, lobed *Quercus robur* leaves.
- **What the camera does:** Starts at `[0.0, 0.32, 0.68]` looking at `[0.0, 0.16, 0.0]` (`MICROSCOPIC` scale, `p < 0.07`) and drifts to `[0.18, 0.42, 1.22]` looking at `[0.0, 0.28, 0.0]` (`MACRO` scale, `0.07 <= p < 0.18`).
- **What the tree does:** `saplingGroupRef` stretches vertically (`1.0 + saplingGrowth * 1.85`) and thickens (`1.0 + saplingGrowth * 1.4`) as its 7 leaves unfurl and flutter. Simultaneously, the core GPU bark trunk (`level = 0`, `aBirth = 0.05`) begins emerging inside the stem core.
- **What UI appears:** Top `Navigation` bar (`LENS · MICROSCOPIC` / `MACRO`), left `ProgressIndicator` rail (`STAGE 01` active), and bottom editorial card: *"From Microscopic Stillness"* with scroll cue `"SCROLL SLOWLY TO AWAKEN THE SEED"`.
- **Next state:** At `scrollProgress = 0.18`, transitions to `STEM` (`STAGE 02`).

#### 2. STAGE 02 — DEVELOPING STEM (`scrollProgress: 0.18 – 0.36`)
- **What the user sees:** The camera pulls back to reveal an ascending woody stem (`y = 0.55m .. 2.8m`) sprouting 9 alternate juvenile lateral shoots (`level = 1.8`) covered in young oak leaves, while fallen weathered leaves appear around the base (`effectiveGrowth > 0.18`).
- **What the camera does:** Tracks along the Catmull-Rom spline through `[-0.65, 1.35, 3.1]` looking at `[0.0, 1.25, 0.0]` (`CLOSE` scale).
- **What the tree does:** `treeGrowth` rises from `~0.20` to `~0.54`. At `smoothProgress = 0.23`, the macro seedling mesh (`saplingGroupRef.visible`) hides after being seamlessly absorbed inside the thickening woody trunk.
- **What UI appears / disappears:** Bottom caption transitions to `STAGE 02 · DEVELOPING STEM · EARLY VASCULARITY` (*"The Ascending Stem"*). Scroll cue updates to `"SCROLL TO GROW THROUGH TIME"`.
- **Next state:** At `scrollProgress = 0.36`, transitions to `YOUNG_TREE` (`STAGE 03`).

#### 3. STAGE 03 — YOUNG TREE (`scrollProgress: 0.36 – 0.54`)
- **What the user sees:** The stem thickens into a furrowed oak trunk with 9 spreading surface roots. At `y ≈ 2.6m`, 3 heavy co-dominant trunks fork outward, followed by 5 Hero Story Boughs and 20 Primary Crown Boughs. Crucially, the lower juvenile shoots from Stage 02 naturally self-prune (`uGrowth` `0.46 -> 0.60`), leaving a clean, monumental lower trunk.
- **What the camera does:** Orbits outward and upward through `[1.25, 2.85, 7.6]` toward `[-0.4, 3.85, 17.5]`, looking at `[0.0, 2.75, 0.0]` → `[0.0, 3.65, 0.0]` (`MEDIUM` scale).
- **What the tree does:** `treeGrowth` progresses from `~0.54` to `~0.86`. Secondary branches (`level = 2.0–2.1`) and hundreds of volumetric leaf sprays unfurl across the mid and upper canopy. Volumetric sunbeams (`godRaysGroupRef`) begin fading in once `treeGrowth > 0.48`.
- **What UI appears:** Bottom caption updates to `STAGE 03 · YOUNG TREE · ASYMMETRIC CANOPY` (*"Branching Into Space"*).
- **Next state:** At `scrollProgress = 0.54`, transitions to `FULL_TREE` (`STAGE 04`).

#### 4. STAGE 04 — FULL TREE (`scrollProgress: 0.54 – 0.71`)
- **What the user sees:** The complete, centuries-old Ancient Oak standing in full scale inside the forest clearing. Its base features a 2.12m-wide fluted trunk and root buttresses; its upper dome holds thousands of sunlit and shaded green oak leaf clusters. Between `0.54` and `0.68`, five bronze-and-cotton-rag **Hanging Archival Cards** unfurl from five boughs.
- **What the camera does:** Pulls back to `[0.0, 3.95, 20.8]` (desktop) / `[0.0, 3.95, 26.62]` (mobile), looking at `[0.0, 3.70, 0.0]` (`WIDE` from `0.54–0.64`, `ULTRA-WIDE` from `0.64–0.71`).
- **What the tree does:** Reaches `treeGrowth = 1.0` at `scrollProgress = 0.65`. All 160 tertiary twigs and outer canopy leaves reach 100% maturity and sway gently in the wind.
- **What UI appears:** Bottom caption displays `STAGE 04 · FULL TREE · MONUMENTAL CROWN` (*"The Sovereign Architecture"*).
- **Next state:** At `scrollProgress = 0.71`, enters `STAGE 05` (`BRANCH_APPROACH` → `BRANCH_CARD` → `NEXT_BRANCH`).

#### 5. STAGE 05 — BRANCH EXPLORATION & CONTENT CARDS (`scrollProgress: 0.71 – 0.948`)
- **What the user sees:** The camera dives from the wide clearing into the living canopy, visiting 5 branches sequentially:
  - **Branch 01 (`0.710 – 0.758`):** *"The Silent Genesis"* (Lower East Bough, `y = 2.45m`)
  - **Branch 02 (`0.758 – 0.806`):** *"Rings of Patience"* (Primary Western Limb, `y = 3.40m`)
  - **Branch 03 (`0.806 – 0.854`):** *"The Unseen Network"* (Deep Canopy Fork, `y = 4.45m`)
  - **Branch 04 (`0.854 – 0.902`):** *"Crown of Alchemy"* (Upper Sunward Bough, `y = 4.95m`)
  - **Branch 05 (`0.902 – 0.948`):** *"Seeds of Tomorrow"* (Apex Crown Bough, `y = 5.55m`)
- **What the camera does:** For each branch's local progress `localT`:
  - `0.00 – 0.28`: Smoothly arcs from the previous vantage point through an intermediate `cameraApproach` waypoint to `cameraPosition`.
  - `0.28 – 0.80`: Locks onto `cameraPosition` (`branchLockFactor` peaks at `1.0`) with a subtle `0.14m` horizontal drift while looking at `cameraTarget` (shifted `-0.22m` in X on desktop so the 3D card sits on the left/center while the HUD companion plaque sits on the right).
  - `0.80 – 1.00`: Releases smoothly toward the next branch's `cameraApproach`.
- **What the Hanging Card does:** Swings gently like a physical pendulum from its brass tie ring (`cordLength = 0.70m`) in response to wind, scroll velocity impulses, and mouse parallax. Its dedicated `pointLight` (`branch.accentColor`) brightens from `0.45` to `3.05` intensity when active.
- **What UI appears / disappears:** The bottom stage caption hides (`timeline.activeBranchIndex !== -1`), replaced by the `BranchIndicator` HUD: a top-right `BRANCH 01 / 05` quick-jump bar and a bottom-right glassmorphic companion plaque with specimen metadata, prev/next arrows, and an interactive CTA button (`INSPECT SPECIMEN`, etc.) that opens the full-screen modal dialog.
- **Next state:** At `scrollProgress = 0.948`, transitions to `FULL_TREE_FINALE`.

#### 6. FINALE — FULL TREE FINALE (`scrollProgress: 0.948 – 1.00`)
- **What the user sees:** The camera pulls back out of the upper canopy to a majestic ultra-wide view of the entire Ancient Oak (`[0.0, 3.95, 21.2]`), with heightened golden-hour key light, warm interior canopy radiance, and golden dust motes.
- **What UI appears / disappears:** The `BranchIndicator` HUD disappears. Once `finaleFactor > 0.35`, the finale overlay fades in with a top sacred-geometry header (`COMPLETE ARCHITECTURE · FULL TREE REVEAL`), an unobstructed central viewport showcasing the tree, and a bottom card reading *"Everything Starts Small."* with buttons to **EXPLORE BRANCH STORIES** or **RETURN TO SEED**.

---

## 3. COMPONENT WALKTHROUGH

Every component below exists in `src/` and is actively used at runtime:

### 3.1 `HomePage` (`src/app/page.tsx`)
- **Location:** `src/app/page.tsx`
- **Purpose:** Top-level client page component orchestrating scroll state, timeline computation, keyboard shortcuts (`ArrowLeft`, `ArrowRight`, `Escape`), modal state, dynamic `<TreeScene />` loading, and accessible `sr-only` narrative markup.
- **Inputs:** None (Next.js root page route `/`).
- **Outputs:** Renders `<main className="relative min-h-[1150vh] ...">` containing `<TreeScene />`, `<Navigation />`, `<ProgressIndicator />`, `<BranchIndicator />`, the Finale overlay, and the `sr-only` accessibility narrative.
- **Dependencies:** `next/dynamic`, `lucide-react`, `@/data/branches`, `@/data/experience`, `@/hooks/useReducedMotion`, `@/hooks/useScrollProgress`, `@/hooks/useExperienceTimeline`, and UI/Experience components.
- **State:** `reducedMotion` (`boolean`), `selectedModalBranch` (`BranchStoryData | null`), plus `uiProgress` and `uiVelocity` from `useScrollProgress`.
- **Interaction:** Handles `handleJumpToBranchIndex(index)` (scrolls to `scrollRange[0] + span * 0.52`), `handleSelectBranchFrom3D(branch)`, and global keyboard navigation.
- **Performance Considerations:** Dynamically imports `TreeScene` with `ssr: false` so Three.js is excluded from server-side rendering and split into its own chunk.

### 3.2 `TreeScene` (`src/components/experience/TreeScene.tsx`)
- **Location:** `src/components/experience/TreeScene.tsx`
- **Purpose:** Configures the fixed full-viewport React Three Fiber `<Canvas>`, detects mobile viewports (`window.innerWidth < 768`), synchronizes the Web Audio engine every frame via `<AudioTimelineSync />`, and mounts `<EffectComposer>` on desktop.
- **Inputs:** `scrollRef: React.MutableRefObject<ScrollStateRef>`, `reducedMotion: boolean`, `onSelectBranch: (branch: BranchStoryData) => void`.
- **Outputs:** Full-screen fixed `div` (`bg-[#070a07]`) wrapping R3F `<Canvas>`.
- **Dependencies:** `@react-three/fiber`, `@react-three/postprocessing`, `Environment`, `CameraController`, `TreeGrowth`, `BranchExplorer`, `ParticleSystem`, `audioEngine`.
- **State:** `isMobile` (`boolean`, true when `window.innerWidth < 768`).
- **Animation:** `<AudioTimelineSync />` runs inside `useFrame` to feed `smoothProgress`, `velocity`, and `activeBranchIndex` to `audioEngine.updateFromTimeline()`.
- **Performance Considerations:** Caps `dpr` to `[1, 1.5]` on mobile and `[1, 2]` on desktop; disables shadow maps (`shadows={!isMobile}`) and post-processing (`!isMobile`) on mobile viewports.

### 3.3 `CameraController` (`src/components/experience/CameraController.tsx`)
- **Location:** `src/components/experience/CameraController.tsx`
- **Purpose:** Drives the Three.js `PerspectiveCamera` position and `lookAt` target every frame across all three experience phases (Growth Spline, Branch Exploration, Finale Pullback).
- **Inputs:** `scrollRef`, `isMobile`, `reducedMotion`.
- **Outputs:** `null` (mutates `state.camera` directly inside `useFrame`).
- **Dependencies:** `@react-three/fiber`, `three`, `@/data/branches`, `@/hooks/useScrollProgress`.
- **State:** `currentPosRef` (`THREE.Vector3`), `currentLookAtRef` (`THREE.Vector3`), memoized `growthPosCurve` and `growthTargetCurve` (`THREE.CatmullRomCurve3`).
- **Animation:** Evaluates spline or branch waypoint vectors into `desiredPos` and `desiredTarget`, adds pointer parallax + time-based sinusoidal breathing (`!reducedMotion`), and applies exponential smoothing (`lerpFactor = reducedMotion ? 0.28 : 0.09`).
- **Performance Considerations:** Reuses pre-allocated `desiredPos` and `desiredTarget` vectors across frames; zero React state updates.

### 3.4 `Environment` (`src/components/experience/Environment.tsx`)
- **Location:** `src/components/experience/Environment.tsx`
- **Purpose:** Manages background color (`#070a07`), exponential fog (`THREE.FogExp2`), hemisphere light, shadow-casting golden-hour key directional light, fill light, rim backlight, interior crown point light, and 3 additive volumetric god-ray planes.
- **Inputs:** `scrollRef`, `isMobile`.
- **Outputs:** Three.js lights, fog, background color, and god-ray mesh group.
- **Dependencies:** `@react-three/fiber`, `three`, `computeTimelineSnapshot`.
- **Animation:** Dynamically adjusts fog density (`0.045 -> 0.032 -> 0.018`), light intensities, key light sun elevation (`y = 11.5 + treeGrowth * 2.0`), and god-ray shimmer opacity in `useFrame`.
- **Performance Considerations:** Generates the `128×256` god-ray gradient texture once in memory (`createGodRayGradientTexture()`); disables directional shadow casting on mobile.

### 3.5 `TreeGrowth` (`src/components/experience/TreeGrowth.tsx`)
- **Location:** `src/components/experience/TreeGrowth.tsx`
- **Purpose:** Renders the displaced 42m × 42m forest clearing floor mesh, 260 (desktop) / 130 (mobile) instanced 3D micro-soil clods and moss cushions, and mounts `<TreeModel />`.
- **Inputs:** `scrollRef`, `isMobile`, `reducedMotion`.
- **Outputs:** `<group name="tree-growth-stage">` containing floor mesh, soil granules `instancedMesh`, and `<TreeModel />`.
- **Dependencies:** `@react-three/drei` (`useTexture`), `three`, `TreeModel`.
- **Performance Considerations:** Computes displaced floor geometry and radial vignette vertex colors once via `useMemo`; populates soil granule instance matrices once in `useEffect` (static throughout the session).

### 3.6 `TreeModel` (`src/components/experience/TreeModel.tsx`)
- **Location:** `src/components/experience/TreeModel.tsx`
- **Purpose:** Renders and animates the complete *Quercus robur* botanical life cycle: the Stage 01 macro seedling (`saplingGroupRef`), the unified GPU-grown ancient bark mesh (`treeData.barkGeometry`), the instanced volumetric twig-spray clusters (`sprayMeshRef`), the instanced close-up veined oak leaves (`leafMeshRef`), and the instanced fallen floor leaves (`fallenMeshRef`).
- **Inputs:** `scrollRef`, `isMobile`, `reducedMotion`.
- **Outputs:** `<group name="living-ancient-oak-world">` with seedling meshes, directional bark rim lights, unified bark `<mesh>`, and 3 `<instancedMesh>` layers.
- **Dependencies:** `@react-three/fiber`, `@react-three/drei`, `three`, `generateProceduralTree`, `getBotanicalTextures`, `applyBarkGrowthShader`, `computeTimelineSnapshot`.
- **Animation:** Every frame in `useFrame`:
  1. Updates `barkUniforms` (`uGrowth`, `uTime`, `uWindStrength`, `uFinaleGlow`).
  2. Scales and sways `saplingGroupRef` and unfurls its 7 leaves (`smoothProgress < 0.23`).
  3. Updates instance matrices for `sprayMeshRef` and `leafMeshRef` with cubic-ease growth, juvenile pruning (`pruneStart`/`pruneEnd`), and height-scaled wind sway.
- **Performance Considerations:** Entire hierarchical bark skeleton (303 tubes on desktop) is drawn in **1 draw call** (`<mesh geometry={treeData.barkGeometry}>`), and all ~5,000 foliage elements are drawn in **3 instanced draw calls**.

### 3.7 `BranchExplorer` (`src/components/experience/BranchExplorer.tsx`) & `HangingCard` (`src/components/experience/HangingCard.tsx`)
- **Location:** `src/components/experience/BranchExplorer.tsx` and `src/components/experience/HangingCard.tsx`
- **Purpose:** Renders the 5 physical 3D Hanging Archival Cards suspended from the 5 Hero Story Boughs.
- **Inputs:** `branch: BranchStoryData`, `index: number`, `scrollRef`, `reducedMotion`, `onSelectBranch`.
- **Outputs:** 5 anchored 3D pendulum groups, each with a `pointLight`, brass torus tie ring, suspension cord cylinder, top brass clasp, dark bronze outer frame, gold filigree bevel, cotton-rag matboard, upper 3:4 botanical photograph plane, lower Canvas2D letterpress plaque plane, and backside medallion.
- **State:** `hovered` (`boolean`), `physicsRef` (`{ angleX, angleZ, velX, velZ }`).
- **Animation:** Unfurls scale between `scrollProgress` `0.54 + index * 0.018` and `0.66 + index * 0.018`; simulates spring-damper pendulum oscillation driven by wind, scroll velocity impulse, and mouse parallax; lerps card `pointLight` intensity when active or hovered.
- **Interaction:** Raycast `onPointerOver`, `onPointerOut` (changes `document.body.style.cursor` and frame border tint), and `onClick` (invokes `onSelectBranch(branch)`).

### 3.8 `ParticleSystem` (`src/components/experience/ParticleSystem.tsx`)
- **Location:** `src/components/experience/ParticleSystem.tsx`
- **Purpose:** Renders two `<points>` particle layers: microscopic rising soil/sapling spores (`microPointsRef`) and wide canopy golden dust motes/pollen (`canopyPointsRef`).
- **Inputs:** `scrollRef`, `isMobile`, `reducedMotion`.
- **Outputs:** `<group name="atmospheric-particles">` with two `THREE.Points` systems.
- **Animation:** Spores drift upward (`y += 0.0007`, wrapping at `y > 1.35`) and fade out as `treeGrowth` increases (`0.65 -> 0.18`); canopy motes rotate slowly (`rotation.y = elapsed * 0.018`) and brighten with `treeGrowth` and `finaleFactor`. Halts motion when `reducedMotion` is enabled.

### 3.9 UI Overlay Components (`src/components/ui/*`)
- **`Navigation.tsx`:** Top fixed header with brand button (`ARBOREA`), live camera scale pill (`LENS · MICROSCOPIC` .. `ULTRA-WIDE`), 6 desktop stage quick-jump buttons (`01 Sapling` .. `06 Finale`), Web Audio toggle button (`SOUND` / `SOUND ON`), and reduced-motion toggle (`CINEMA MOTION` / `CALM MOTION`).
- **`ProgressIndicator.tsx`:** Left vertical timeline rail (desktop `md:flex`) displaying `SCROLL CHRONICLE` percentage, hairline gradient progress bar, 6 clickable stage dots, `BIOMASS MATURITY` percentage, and the bottom centered stage editorial card + bouncing scroll prompt.
- **`BranchIndicator.tsx`:** Active during `timeline.activeBranchIndex >= 0` (`scrollProgress` `0.71–0.948`). Renders top-right `BRANCH 01 / 05` counter with direct branch jump buttons, bottom-right editorial companion plaque, and the full-screen specimen modal dialog (`selectedModalBranch`).

---

## 4. DATA FLOW

```
Window Scroll (window.scrollY) & Pointer Move (clientX, clientY)
      │
      ▼
useScrollProgress(reducedMotion)  [src/hooks/useScrollProgress.ts]
      ├──► scrollRef.current (Updated at 60fps via requestAnimationFrame)
      │      • targetProgress [0..1]
      │      • smoothProgress [0..1] (damping: 0.075 normal / 0.35 reducedMotion)
      │      • velocity       (delta * 18, decays * 0.85)
      │      • pointerX, pointerY [-1..1]
      │
      └──► uiProgress, uiVelocity (Throttled React state updated every >= 48ms)
             │
             ▼
computeTimelineSnapshot(scrollProgress, scrollVelocity)  [src/hooks/useExperienceTimeline.ts]
      │
      ├──► Consumed at 60fps inside Three.js useFrame() hooks:
      │      ├── CameraController.tsx  ──► Interpolates camera.position & camera.lookAt
      │      ├── TreeModel.tsx         ──► Updates uGrowth shader uniform, sapling, & foliage instances
      │      ├── HangingCard.tsx       ──► Updates card reveal scale, pendulum physics, & pointLight
      │      ├── Environment.tsx       ──► Updates FogExp2 density, sun elevation, & god-ray opacity
      │      ├── ParticleSystem.tsx    ──► Updates spore & pollen particle motion and opacity
      │      └── TreeScene.tsx         ──► Updates audioEngine.updateFromTimeline()
      │
      └──► Consumed at ~20Hz inside React UI components:
             ├── Navigation.tsx        ──► Highlights active stage & displays cameraScale
             ├── ProgressIndicator.tsx ──► Updates progress %, biomass %, & stage caption card
             ├── BranchIndicator.tsx   ──► Displays active branch HUD plaque & specimen modal
             └── HomePage (page.tsx)   ──► Reveals Finale overlay when finaleFactor > 0.35
```

---

## 5. TREE SYSTEM

### How the Tree Is Constructed
The tree does **not** rely on an external static `.glb`/`.gltf` file because a static mesh cannot biologically grow its trunk girth, self-prune juvenile shoots, and unfurl individual branches along a continuous scroll timeline without rigid scaling artifacts. Instead, it uses a **hybrid procedural + PBR textured + GPU vertex-shader architecture**:

1. **Deterministic Procedural Hierarchy (`src/lib/treeGenerator.ts`):**
   - Uses a seeded Park-Miller PRNG (`createSeededRandom(7919)`) so the exact same Ancient Oak is generated on every client.
   - Generates `TubeBranchSpec` definitions across 6 structural tiers:
     - **Tier 1 (Main Bole, `level = 0`):** 8-point spline from `y = -0.18m` to `5.15m`, `radiusStart = 1.06m`, `radiusEnd = 0.22m`, `birthStart = 0.05`, `birthEnd = 0.45`, `matureDuration = 0.34`, with 6-lobed basal root-buttress fluting (`rootFlareMultiplier = 1.0 + Math.pow(basalZone, 2.1) * 0.78`) and organic burls (`hasKnots: true`).
     - **Tier 2 (3 Co-Dominant Crown Trunks, `level = 0.4`):** Forking at `y ≈ 2.6m`, `radiusStart = 0.48..0.56m`, `birthStart = 0.29`, `birthEnd = 0.52`.
     - **Tier 3 (9 Surface Roots, `level = 0.3`):** Spreading `1.95m..3.20m` across the ground from the root collar, `radiusStart = 0.40..0.52m`, `birthStart = 0.26..0.35`.
     - **Tier 4 (9 Juvenile Stem Shoots, `level = 1.8`):** Early lateral shoots along `y = 0.55m..2.8m`, `birthStart = 0.07..0.246`, configured with **`pruneAt = 0.46`** so they retract and vanish as the adult trunk thickens.
     - **Tier 5 (5 Hero Story Boughs + 20 Sub-Branches, `level = 1.0` & `2.0`):** Splines routed directly through the 5 `branches[i].branchAttachment` coordinates (`src/data/branches.ts`) so each `HangingCard` brass ring is physically wrapped around a major bough.
     - **Tier 6 (20 Primary Crown Boughs, 80 Secondary Branches, 160 Tertiary Twigs on Desktop; 14 / 42 / 42 on Mobile):** Arranged using golden-angle azimuth (`2.39996 rad`) and dome width profiles starting above `y = 2.55m` (`heightRatio >= 0.48`).
   - All 303 tube specs (desktop) / 183 tube specs (mobile) are merged into a single indexed `THREE.BufferGeometry` (`barkGeometry` with **53,907 vertices** on desktop / **27,139 vertices** on mobile).

2. **GPU Biological Growth Shader (`src/shaders/treeShaders.ts`):**
   - `applyBarkGrowthShader()` injects custom GLSL into `MeshStandardMaterial` and `MeshDepthMaterial` via `onBeforeCompile`.
   - Each vertex carries `aSpinePos` (the center point on the branch spline), `aBirth`, `aMature`, `aPrune`, and `aLevel`.
   - In the vertex shader:
     - `emergeFactor = smoothGrowth(aBirth, aMature, uGrowth)`
     - `pruneFactor = aPrune > 0.0 ? (1.0 - smoothGrowth(aPrune, aPrune + 0.14, uGrowth)) : 1.0`
     - `localGrowth = emergeFactor * pruneFactor`
     - Vertices expand radially outward from `aSpinePos` along `radialOffset = position - aSpinePos` scaled by `radiusScale` (which blends a juvenile-to-ancient power curve with `ancientGirthBoost`).
     - Outer branches (`aLevel > 0.8`) sway in the wind via `sin/cos(uTime ...)` scaled by `uWindStrength`.
   - In the fragment shader:
     - `if (vLocalGrowth < 0.035) discard;` cleanly clips unborn or fully pruned branch segments in both the color pass and the shadow depth pass.

3. **Botanical Leaf & Twig-Spray Textures (`src/lib/botanicalTextures.ts`):**
   - Generates four `512×512` `THREE.CanvasTexture` maps on the client (`cachedTextures` singleton):
     - `leafColorMap` & `leafNormalMap`: A single deeply-lobed *Quercus robur* leaf with petiole stalk, primary midrib, 4 pairs of quadratic-bezier lateral veins, and normal-map RGB gradients.
     - `sprayColorMap` & `sprayNormalMap`: A branching woody twig skeleton bearing 22 differently angled and hue-shifted oak leaves.

4. **Foliage Geometry & Instancing (`src/components/experience/TreeModel.tsx`):**
   - `createCurvedOakLeafGeometry()`: A `6×8` subdivided plane bent in 3D (`archZ = Math.sin(y * Math.PI) * 0.11 - Math.abs(x) * 0.15 + Math.sin(y * 9.0 + x * 6.0) * 0.016`) so every single leaf has a real V-channel midrib and arched blade.
   - `createVolumetricSprayGeometry()`: Merges three curved `1.12m × 1.12m` planes rotated at `0°`, `120°`, and `240°` around Y and pitched `0.32–0.48 rad` in X, creating a true 3D volumetric foliage cluster free of flat billboard artifacts.

---

## 6. SCROLL SYSTEM

- **Implementation:** `src/hooks/useScrollProgress.ts` and `src/hooks/useExperienceTimeline.ts`.
- **Scroll Container:** `<main className="relative min-h-[1150vh] w-full select-none bg-[#060907]">` in `src/app/page.tsx` provides `10.5×` viewport heights of scrollable travel distance.
- **Progress Calculation:**
  - `maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)`
  - `targetProgress = clamp(window.scrollY / maxScroll, 0, 1)`
- **Interpolation & Damping:**
  - Inside a continuous `requestAnimationFrame` loop (`tick`), `delta = targetProgress - smoothProgress`.
  - `smoothProgress += delta * damping`, where `damping = 0.075` (normal) or `0.35` (`reducedMotion`).
  - `velocity = delta * 18` when moving, decaying by `*= 0.85` when `|delta| <= 0.00001`.
- **Biological Growth Formula (`useExperienceTimeline.ts`):**
  - `rawGrowth = clamp01(p / 0.65)`
  - `treeGrowth = rawGrowth * 0.45 + smoothstep(0.0, 0.65, p) * 0.55`
  - This linear-plus-smoothstep blend ensures Stage 01 (`p = 0.00..0.18`) has immediate visible stem growth, Stage 02 (`p = 0.24`) is ~32% grown, Stage 03 (`p = 0.44`) is ~70% grown, and Stage 04 (`p >= 0.65`) reaches `1.0` (100% maturity).
- **Reverse & Fast Scrolling:**
  - Scrolling upward makes `delta` negative; `smoothProgress` smoothly decreases, causing `uGrowth` to decrease, outer leaves to fold back into buds, self-pruned juvenile shoots to re-emerge (`0.60 -> 0.46`), and the camera to glide back down the spline to the macro seedling.
  - Fast scrolling (e.g., dragging the scrollbar or clicking a top nav waypoint via `scrollToProgress`) sets `targetProgress` immediately while `smoothProgress` glides exponentially through every intermediate state without frame spikes.

---

## 7. CAMERA SYSTEM

Implemented in `src/components/experience/CameraController.tsx` and `src/components/experience/TreeScene.tsx`:
- **Camera Type:** `THREE.PerspectiveCamera`
- **Field of View (`fov`):** `42°` on desktop (`window.innerWidth >= 768`), `50°` on mobile (`< 768`).
- **Clipping Planes:** `near = 0.02`, `far = 65` (allows 30cm macro inspection of the acorn without near-plane clipping while keeping the 42m forest clearing inside the far plane).
- **Phase 1 — Growth Spline (`0.00 <= p <= 0.71`):**
  - `curveT = clamp(p / 0.71, 0, 1)`
  - Evaluates `growthPosCurve.getPointAt(curveT)` and `growthTargetCurve.getPointAt(curveT)`:
    | `curveT` | Scroll `p` | Desktop Position `[x, y, z]` | Mobile Position (`z * 1.28`) | LookAt Target `[x, y, z]` |
    | :--- | :--- | :--- | :--- | :--- |
    | `0.00` | `0.000` | `[0.00, 0.32, 0.68]` | `[0.00, 0.32, 0.87]` | `[0.00, 0.16, 0.00]` |
    | `0.20` | `0.142` | `[0.18, 0.42, 1.22]` | `[0.18, 0.42, 1.56]` | `[0.00, 0.28, 0.00]` |
    | `0.40` | `0.284` | `[-0.65, 1.35, 3.10]` | `[-0.65, 1.35, 3.97]` | `[0.00, 1.25, 0.00]` |
    | `0.60` | `0.426` | `[1.25, 2.85, 7.60]` | `[1.25, 2.85, 9.73]` | `[0.00, 2.75, 0.00]` |
    | `0.80` | `0.568` | `[-0.40, 3.85, 17.50]` | `[-0.40, 3.85, 22.40]` | `[0.00, 3.65, 0.00]` |
    | `1.00` | `0.710` | `[0.00, 3.95, 20.80]` | `[0.00, 3.95, 26.62]` | `[0.00, 3.70, 0.00]` |
- **Phase 2 — Branch Exploration (`0.71 < p < 0.948`):**
  - Uses each branch's `cameraApproach`, `cameraPosition`, and `cameraTarget` from `src/data/branches.ts` (with `mobileCardZOffset = isMobile ? 0.65 : 0.0` and `mobileCardXShift = isMobile ? 0.0 : -0.22`):
    | Branch | Scroll Range | `cameraApproach` | `cameraPosition` | `cameraTarget` |
    | :--- | :--- | :--- | :--- | :--- |
    | `branch-01` | `[0.710, 0.758]` | `[5.8, 3.6, 6.8]` | `[1.98, 2.42, 3.45]` | `[2.35, 2.48, 1.65]` |
    | `branch-02` | `[0.758, 0.806]` | `[-5.4, 4.4, 6.2]` | `[-2.20, 3.38, 3.18]` | `[-2.65, 3.42, 1.40]` |
    | `branch-03` | `[0.806, 0.854]` | `[-5.2, 5.2, 1.2]` | `[-0.65, 4.42, -0.72]` | `[-1.85, 4.48, -2.15]` |
    | `branch-04` | `[0.854, 0.902]` | `[5.8, 5.6, 2.4]` | `[1.62, 4.92, 0.12]` | `[2.55, 4.98, -1.45]` |
    | `branch-05` | `[0.902, 0.948]` | `[2.8, 6.2, 6.4]` | `[0.12, 5.52, 4.08]` | `[0.25, 5.58, 2.25]` |
- **Phase 3 — Finale Pullback (`0.948 <= p <= 1.00`):**
  - `finaleT = smoothstep(0.948, 0.992, p)`
  - Interpolates from `[0.0, 4.2, 10.2]` (mobile `12.5`) to `[0.0, 3.95, 21.2]` (mobile `26.2`), looking at `[0.0, 3.70, 0.0]`.

---

## 8. VISUAL SYSTEM

- **Color Palette:**
  - Background & Fog: Obsidian forest night `#070a07` / `#060907`
  - UI Typography & Cards: Archival warm ivory `#f4efe4`, muted sage `#9ba89d`, museum gold `#d4af37` / `#e5c992`, living emerald `#78c88a` / `#84cc8e`
  - Canopy Chlorophyll Palette (`src/lib/treeGenerator.ts`):
    - Inner shaded canopy: `#2f5723`, `#39692b`, `#437833`
    - Outer sunlit canopy: `#4f873b`, `#5d9944`, `#6ca84e`, `#7db858`
  - Bark Vertex Colors: Crevice `#47382b`, sunlit ridge `#f0e2d0`, basal moss `#5c7d42`
- **Lighting Architecture (`Environment.tsx` & `TreeModel.tsx`):**
  - `hemisphereLight`: Sky `#5e7d63`, ground `#1c1812`, intensity `1.35`
  - `keyLightRef` (`directionalLight`): Warm golden-hour sun `#fff1d6`, position `[6.5, 11.5..13.5, 6.2]`, intensity `2.4 -> 4.05`, casting `2048×2048` shadow map (`near: 0.5`, `far: 35`, orthographic frustum `[-14, 14]`, `bias: -0.0005`)
  - `fillLightRef` (`directionalLight`): Cool sky diffuse `#96b39b`, position `[-6, 5, 4]`, intensity `0.85 -> 1.30`
  - `rimLightRef` (`directionalLight`): Subsurface leaf backlight `#dceaa8`, position `[-5, 9, -7]`, intensity `1.25 -> 2.10`
  - Low-angle bark relief lights (`TreeModel.tsx`): Two directional lights at `[6.5, 2.2, 8.5]` (`#ffe4b8`, intensity `2.35`) and `[-6.0, 2.0, 6.5]` (`#c8d9b8`, intensity `1.15`) specifically raking across the lower trunk fissures and root buttresses
  - `crownGlowRef` (`pointLight`): Interior canopy bounce `[0, 4.2, 0.5]`, `#d4c48a`, distance `14`, intensity `0 -> 3.2`
  - `saplingLightRef` (`pointLight`): Macro clearing light `[0.18, 0.58, 0.42]`, `#fff4d2`, intensity `2.2` during Stage 01, fading out completely by `scrollProgress = 0.35`
  - 5 Card Gallery Lights (`HangingCard.tsx`): Per-card `pointLight` with `branch.accentColor`, distance `3.6`, brightening to `3.05` when the user inspects that branch
- **Post-Processing (`TreeScene.tsx`, desktop only):**
  - `<EffectComposer enableNormalPass={false}>`
  - `<Bloom luminanceThreshold={0.82} mipmapBlur intensity={0.22} radius={0.55} />`
  - `<Vignette eskil={false} offset={0.16} darkness={0.72} />`

---

## 9. RESPONSIVE BEHAVIOR

Viewport responsiveness is driven by `isMobile = window.innerWidth < 768` in `src/components/experience/TreeScene.tsx` and Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`):

| Subsystem | Desktop / Laptop (`>= 768px`) | Mobile / Compact Tablet (`< 768px`) |
| :--- | :--- | :--- |
| **Canvas DPR** | `[1, 2]` | `[1, 1.5]` |
| **Camera FOV** | `42°` | `50°` |
| **Growth Spline Z Distance** | `1.0×` (`z = 0.68 .. 20.8`) | `1.28×` (`z = 0.87 .. 26.62`) so full width of oak crown fits portrait screens |
| **Branch Card Camera Offset** | `mobileCardZOffset = 0.0`, `mobileCardXShift = -0.22` | `mobileCardZOffset = +0.65`, `mobileCardXShift = 0.0` (centers 3D card above bottom HUD) |
| **Shadow Maps** | Enabled (`2048×2048` directional shadows) | Disabled (`shadows={false}`) |
| **Post-Processing** | `EffectComposer` (`Bloom` + `Vignette`) active | Disabled to save mobile fragment fill-rate |
| **Procedural Bark Mesh** | 303 tubes (`53,907` vertices, `98,352` triangles) | 183 tubes (`27,139` vertices, `49,404` triangles) |
| **Volumetric Spray Clusters** | `2,796` instances | `1,039` instances |
| **Individual Veined Leaves** | `2,166` instances | `794` instances |
| **Fallen Floor Leaves** | `180` instances | `90` instances |
| **3D Soil Granules** | `260` instances; floor grid `104×104` | `130` instances; floor grid `64×64` |
| **Atmospheric Particles** | `240` micro spores + `480` canopy motes | `120` micro spores + `220` canopy motes |
| **Navigation & Progress UI** | Full stage waypoint bar (`lg:flex`) + left vertical rail (`md:flex`) | Compact top header + bottom stage/branch card |

---

## 10. PERFORMANCE & OPTIMIZATION

- **Draw Call Consolidation:**
  - All 303 hierarchical bark tubes (main bole, co-dominant trunks, surface roots, juvenile shoots, hero boughs, primary/secondary/tertiary branches) are merged into a **single `THREE.BufferGeometry`** drawn in **1 draw call**.
  - All canopy spray clusters (`2,796`), individual leaves (`2,166`), fallen leaves (`180`), and soil clods (`260`) use `THREE.InstancedMesh` (**4 draw calls total**).
- **Zero-Allocation Render Loop & React Decoupling:**
  - `scrollRef` holds mutable floats read directly by `useFrame` at 60fps; React state (`uiProgress`) is throttled to `48ms` intervals so React DOM overlays never bottleneck WebGL frame timing.
- **Procedural In-Memory Botanical Atlases:**
  - Leaf and twig-spray diffuse + normal maps (`512×512`) are generated once on first mount via `getBotanicalTextures()` and cached in module scope (`cachedTextures`), eliminating 4 network image downloads.
- **Known Bottlenecks:**
  1. `TreeModel.tsx` loops over `treeData.sprayClusters` (`2,796` iterations desktop) and `treeData.individualLeaves` (`2,166` iterations desktop) inside `useFrame` to update `instanceMatrix` every frame. On modern desktop/mobile CPUs this takes ~1ms, but on older low-power devices, moving per-instance scale/wind math into a custom vertex shader with static instance attributes would further reduce CPU usage.
  2. `frustumCulled={false}` is required on the merged bark and foliage meshes because vertex shader displacement (`uGrowth`) alters vertex positions dynamically.
