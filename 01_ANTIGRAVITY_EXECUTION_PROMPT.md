# 01 — ANTIGRAVITY MASTER EXECUTION SPECIFICATION

> **Execution Directive for AI Agents / Antigravity Instances:**
> When instructed to *"Go through `01_ANTIGRAVITY_EXECUTION_PROMPT.md` and execute everything specified in it"*, treat this document as your authoritative execution specification. Inspect the repository, verify every subsystem against the exact parameters documented below, maintain all non-negotiable visual and architectural constraints, and never introduce placeholder, cartoon, or low-poly regressions.

---

## 1. PROJECT OBJECTIVE

### What the Project Is
**ARBOREA (`immersive-3d-tree-growth`)** is a single-page, scroll-driven, real-time 3D WebGL storytelling experience built with **Next.js 14.2.16 (App Router)**, **React 18.3.1**, **TypeScript 5.6.3**, **Three.js (`^0.169.0`)**, **React Three Fiber (`^8.17.10`)**, **@react-three/drei (`^9.114.0`)**, **@react-three/postprocessing (`^2.16.3`)**, and **Tailwind CSS (`^3.4.14`)**.

### What the User Experience Is
Rather than scrolling down a traditional marketing page with isolated 3D widgets, the user scrolls through a **1150vh** scroll container (`<main className="relative min-h-[1150vh] w-full select-none bg-[#060907]">`) that drives a **single continuous 3D world** (`<TreeScene />` fixed at `inset-0`). Scrolling acts as biological time and spatial camera choreography simultaneously.

### What the 3D Tree Represents
The 3D specimen represents a centuries-old **Ancient English Oak (*Quercus robur*)** growing in a forest clearing at golden hour. It is generated deterministically on the client via a seeded Park-Miller PRNG (`seed = 7919` in `src/lib/treeGenerator.ts`) and rendered using custom vertex/fragment shader injection (`src/shaders/treeShaders.ts`), PBR bark and soil textures (`public/textures/oak-bark.jpg`, `public/textures/forest-soil.jpg`), and high-resolution procedural botanical Canvas2D normal/albedo maps (`src/lib/botanicalTextures.ts`).

### What the Scroll Interaction Does
Window scroll position (`window.scrollY`) is normalized into `[0, 1]` (`targetProgress`) and smoothly damped at 60fps in `src/hooks/useScrollProgress.ts` (`smoothProgress`). Every frame, `smoothProgress` and `velocity` are evaluated by the pure state machine `computeTimelineSnapshot()` in `src/hooks/useExperienceTimeline.ts` to drive:
1. GPU vertex displacement for trunk/branch emergence, radial thickening, and juvenile self-pruning (`uGrowth` uniform).
2. Instanced foliage emergence, scale easing, and wind rustling across **1,500+ 3D volumetric twig-spray clusters** and **1,100+ individual doubly-curved veined oak leaves** (on desktop).
3. Continuous 3D camera position and target interpolation along `THREE.CatmullRomCurve3` splines and branch-to-branch orbital arcs (`src/components/experience/CameraController.tsx`).
4. Atmospheric fog density, golden-hour directional sunlight intensity, canopy god-rays, and dual-layer floating spore/pollen particle opacity.
5. Procedural Web Audio API pink-noise wind filtering and harmonic branch chimes (`src/lib/audioEngine.ts`, muted by default until user opt-in).

### What the Four Growth Stages Are
1. **STAGE 01 — SAPLING (`SAPLING`, Scroll `0.00 – 0.18`, Lens: `MICROSCOPIC` → `MACRO`):**
   - Begins 68cm from the forest floor (`camera.position = [0.0, 0.32, 0.68]`, `lookAt = [0.0, 0.16, 0.0]`).
   - Displays a dedicated botanical *Quercus robur* seedling assembly (`saplingGroupRef` in `src/components/experience/TreeModel.tsx`) with a weathered germinating acorn nut, scaly acorn cupule (cap), emerging primary radicle and lateral micro-roots anchored in displaced forest humus (`public/textures/forest-soil.jpg`), a slender tapered hypocotyl stem, terminal apical bud, and 7 doubly-curved veined lobed oak leaves on delicate petioles arranged in spiral phyllotaxy.
2. **STAGE 02 — DEVELOPING STEM (`STEM`, Scroll `0.18 – 0.36`, Lens: `CLOSE`):**
   - Camera pulls back and rises (`[-0.65, 1.35, 3.1]`, `lookAt = [0.0, 1.25, 0.0]`).
   - The seedling seamlessly transitions into the woody trunk (`saplingGroupRef.visible = smoothProgress < 0.23`) as 9 juvenile lateral stem shoots (`level = 1.8`) unfurl along `y = 0.55m .. 2.8m` with young oak leaves and twig sprays.
3. **STAGE 03 — YOUNG TREE (`YOUNG_TREE`, Scroll `0.36 – 0.54`, Lens: `MEDIUM`):**
   - Camera moves to medium forest framing (`[1.25, 2.85, 7.6]`, `lookAt = [0.0, 2.75, 0.0]`).
   - Co-dominant upper trunks fork at `y ≈ 2.6m`, 9 ground-hugging surface roots emerge from the basal root flare, and asymmetric primary and secondary boughs expand outward. Meanwhile, the juvenile lower stem shoots from Stage 02 naturally self-prune (`pruneAt = 0.46`, `pruneStart = 0.46`, `pruneEnd = 0.60`) as the lower trunk swells into an ancient bole.
4. **STAGE 04 — FULL TREE (`FULL_TREE`, Scroll `0.54 – 0.71`, Lens: `WIDE` → `ULTRA-WIDE`):**
   - Camera pulls back to wide (`[-0.4, 3.85, 17.5]`) and ultra-wide (`[0.0, 3.95, 20.8]`, `lookAt = [0.0, 3.70, 0.0]`), framing 100% of the mature Ancient Oak crown (`treeGrowth = 1.0` at `scrollProgress >= 0.65`).
   - The tree exhibits a massive fluted basal trunk (`radiusStart = 1.06`, ~2.12m base diameter before root-flare multiplier), 3 heavy co-dominant crown trunks, 5 Hero Story Boughs, 20 Primary Crown Boughs (14 on mobile), 100 Secondary Branches, 160 Tertiary Twigs, and thousands of sunlit/shaded oak leaf clusters.

### What Happens After the Full Tree Appears (Branch Exploration & Hanging Cards)
- **STAGE 05 — BRANCH EXPLORATION (`BRANCH_APPROACH` / `BRANCH_CARD` / `NEXT_BRANCH`, Scroll `0.71 – 0.948`, Lens: `CLOSE`):**
  - Between `scrollProgress` `0.54` and `0.68`, five physical 3D **Hanging Archival Cards** (`src/components/experience/HangingCard.tsx`) unfurl from five specific Hero Boughs.
  - From `0.71` to `0.948`, scrolling guides the camera sequentially through all 5 branches (`branch-01` through `branch-05`).
  - Within each branch's scroll window (`localT` in `[0, 1]`):
    - `0.00 -> 0.28`: Camera arcs smoothly from the previous branch/canopy via `cameraApproach` toward the branch's `cameraPosition`.
    - `0.28 -> 0.80`: Camera holds in front of the physical 3D hanging card (`BRANCH_CARD`) with a subtle horizontal inspection drift (`(holdT - 0.5) * 0.14`).
    - `0.80 -> 1.00`: Camera releases toward the next branch's approach waypoint (`NEXT_BRANCH`).
- **How Hanging Cards Work:**
  - Each card is a real 3D pendulum assembly (`pendulumRef`) suspended from `branch.branchAttachment` via a brass torus tie-ring, braided linen/brass cylinder cord (`cordLength = 0.70m`), and top brass clasp.
  - The frame consists of a dark bronze outer gallery box (`[0.72, 0.94, 0.026]`), inner gold filigree bevel, warm cotton-rag matboard (`#f2ece0`), an upper 3:4 fine-art botanical photograph (`public/images/branches/branch-01.jpg` .. `branch-05.jpg`), and a lower dynamically generated high-resolution Canvas2D archival letterpress plaque (`createArchivalLabelTexture()`).
  - Real-time spring-damper pendulum physics (`angleX`, `angleZ`, `velX`, `velZ`) respond to wind, scroll velocity impulses, and pointer parallax.
  - Clicking any 3D card in WebGL space (or clicking the CTA button in the right-hand companion HUD plaque in `BranchIndicator.tsx`) opens a full-screen accessible specimen inspection modal (`role="dialog"`, `aria-modal="true"`). Users can also navigate between branches via `ArrowLeft` / `ArrowRight` keys or HUD buttons.

### How the Experience Ends & Final Visual Target
- **FINALE — ETERNAL WHOLE (`FULL_TREE_FINALE`, Scroll `0.948 – 1.00`, Lens: `ULTRA-WIDE`):**
  - The camera pulls back from `[0.0, 4.2, 10.2]` to `[0.0, 3.95, 21.2]` (mobile `z = 26.2`), looking at `[0.0, 3.70, 0.0]`.
  - `finaleFactor` (`smoothstep(0.945, 0.99, p)`) intensifies golden-hour key lighting, canopy interior glow, god-ray shimmer, and atmospheric pollen opacity.
  - The center of the viewport remains completely unobstructed so the monumental Ancient Oak is the undisputed hero, while a restrained glassmorphic card at the bottom displays *"Everything Starts Small."* with action buttons to **EXPLORE BRANCH STORIES** (jumps to Branch 01) or **RETURN TO SEED** (scrolls back to `0.0`).

---

## 2. CURRENT PROJECT STATE

### Verified Implementation Status
- **Fully Implemented & Production-Ready:**
  - Complete Next.js 14 App Router application (`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/icon.svg`).
  - Deterministic procedural *Quercus robur* 3D geometry generator (`src/lib/treeGenerator.ts`) merging 303 hierarchical bark tube segments (desktop) / 183 segments (mobile) into a single indexed `THREE.BufferGeometry` with custom attributes (`aSpinePos`, `aBirth`, `aMature`, `aPrune`, `aLevel`, `uv`, `color`).
  - Custom GLSL vertex/fragment shader injection (`src/shaders/treeShaders.ts`) hooked into both `MeshStandardMaterial` and `MeshDepthMaterial` (`customDepthMaterial`) so real-time directional shadows grow and self-prune accurately in sync with the visible bark geometry.
  - High-resolution procedural Canvas2D botanical texture generator (`src/lib/botanicalTextures.ts`) producing 512×512 color and normal maps for individual veined lobed oak leaves and 22-leaf twig-spray atlases.
  - Dedicated Stage 01 macro botanical seedling (`saplingGroupRef` in `src/components/experience/TreeModel.tsx`) with acorn nut, cupule cap, radicle roots, tapered stem, apical bud, and 7 phyllotactic oak leaves.
  - Displaced 42m × 42m forest humus clearing (`src/components/experience/TreeGrowth.tsx`) with radial vertex-color vignette fading into `#070a07` exponential fog, plus 260 (desktop) / 130 (mobile) instanced 3D soil clods and moss cushions.
  - Five 3D Hanging Archival Cards (`src/components/experience/HangingCard.tsx` & `BranchExplorer.tsx`) with spring-damper pendulum physics, raycast hover/click events, and 5 AI-generated 3:4 botanical photographs (`public/images/branches/branch-01.jpg` .. `branch-05.jpg`).
  - Multi-phase camera choreography (`src/components/experience/CameraController.tsx`) with pointer parallax, organic breathing motion, and mobile Z-distance compensation.
  - Dual-layer particle system (`src/components/experience/ParticleSystem.tsx`), golden-hour lighting + additive god-ray planes (`src/components/experience/Environment.tsx`), and desktop post-processing (`Bloom` + `Vignette` in `src/components/experience/TreeScene.tsx`).
  - Procedural Web Audio spatial soundscape (`src/lib/audioEngine.ts`) with Paul Kellet pink-noise wind filter, D-major warm botanical drone (`73.42Hz`, `110.0Hz`, `185.0Hz`), and pentatonic branch chimes.
  - Editorial UI overlays (`Navigation.tsx`, `ProgressIndicator.tsx`, `BranchIndicator.tsx`), keyboard navigation (`ArrowLeft`, `ArrowRight`, `Escape`), `prefers-reduced-motion` support (`useReducedMotion.ts`), and screen-reader narrative structure (`sr-only`).

### Incomplete / Experimental / Technical Debt
- **Incomplete Features:** None. All stages (`SAPLING`, `STEM`, `YOUNG_TREE`, `FULL_TREE`, `BRANCH_APPROACH`, `BRANCH_CARD`, `NEXT_BRANCH`, `FULL_TREE_FINALE`) are complete and verified.
- **Experimental Aspects:**
  - Procedural Web Audio synthesis (`src/lib/audioEngine.ts`) uses browser `AudioContext` oscillators and pink-noise buffers rather than external `.mp3`/`.ogg` audio files.
- **Known Technical Debt:**
  - `gsap` (`^3.12.5`) and `framer-motion` (`^11.11.17`) are listed in `package.json` dependencies from initial project scaffolding, but all runtime animations are executed natively inside React Three Fiber's `useFrame` loop and CSS transitions to avoid main-thread React re-render overhead. They can either be retained for future UI transitions or removed if bundle size reduction is desired.
  - `public/textures/target-oak-reference.jpg` (1.31 MB) is stored in `public/textures/` as a visual benchmark artifact generated during the realistic redesign; it is not loaded at runtime by the WebGL scene.

### Known Limitations & Known Bugs
- **Known Bugs:** Zero known runtime, TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), or Next.js build (`npm run build`) bugs.
- **Known Visual & Performance Limitations:**
  - In `src/components/experience/TreeModel.tsx`, the instanced matrix buffers for `sprayMeshRef` (2,796 instances desktop / 1,039 mobile) and `leafMeshRef` (2,166 instances desktop / 794 mobile) are updated on the CPU every frame inside `useFrame` to compute individual leaf birth/maturity/pruning and wind flutter. While fast on modern CPUs (<1.5ms/frame), moving foliage wind and growth math entirely into a vertex shader attribute buffer would further reduce CPU-to-GPU bandwidth on low-end mobile devices.
  - Because `frustumCulled={false}` is set on the unified bark mesh and foliage instanced meshes to prevent bounding-box popping during vertex-shader growth, all tree vertices are submitted to the GPU even when zoomed in on a single branch.

---

## 3. EXACT EXECUTION REQUIREMENTS

When executing or maintaining this project, follow these exact 20 steps in order:

1. **Inspect repository:** Verify the root directory structure, `.gitignore`, config files, `public/`, and `src/`.
2. **Read all four documentation files:** Read `01_ANTIGRAVITY_EXECUTION_PROMPT.md`, `02_PROJECT_WALKTHROUGH.md`, `03_TECHNICAL_REPLICATION_GUIDE.md`, and `04_HANDOFF_AND_SKILLS.md` completely before modifying any code.
3. **Inspect `package.json`:** Confirm Next.js `14.2.16`, React `18.3.1`, Three.js `^0.169.0`, `@react-three/fiber` `^8.17.10`, `@react-three/drei` `^9.114.0`, and `@react-three/postprocessing` `^2.16.3`.
4. **Inspect source structure:** Verify all files under `src/app/`, `src/components/experience/`, `src/components/ui/`, `src/data/`, `src/hooks/`, `src/lib/`, `src/shaders/`, and `src/styles/`.
5. **Install dependencies:** Run `npm install` (or `npm install --legacy-peer-deps` if peer resolution warnings arise).
6. **Verify environment:** Confirm Node.js (tested on `v24.11.0`) and npm (tested on `11.6.1`). Confirm no `.env` secrets are required.
7. **Start development server:** Run `npm run dev` and verify the server listens on `http://localhost:3000`.
8. **Verify Three.js/WebGL scene:** Open `http://localhost:3000` in a WebGL2-capable browser, verify zero console errors, and confirm the `<canvas>` renders at 60fps.
9. **Verify tree asset & textures:** Confirm `/textures/oak-bark.jpg`, `/textures/forest-soil.jpg`, and `/images/branches/branch-01.jpg` .. `branch-05.jpg` return HTTP 200 and bind to materials with `THREE.SRGBColorSpace`.
10. **Verify growth timeline:** Scroll from `0%` to `71%` and verify continuous progression through `SAPLING` (`0.00–0.18`), `STEM` (`0.18–0.36`), `YOUNG_TREE` (`0.36–0.54`), and `FULL_TREE` (`0.54–0.71`), including juvenile shoot self-pruning (`0.46–0.60`).
11. **Verify camera choreography:** Confirm smooth Catmull-Rom spline tracking during growth (`0.00–0.71`), orbital branch approaches (`0.71–0.948`), and ultra-wide finale pullback (`0.948–1.00`).
12. **Verify branch exploration:** Scroll through `71%–95%` (`0.71–0.948`), test the top-right `BRANCH 01 / 05` selector, test `ArrowLeft` / `ArrowRight` keyboard shortcuts, and verify the right-hand companion HUD plaque updates for all 5 branches.
13. **Verify hanging cards:** Confirm all 5 physical 3D cards hang below their exact branch attachment coordinates, sway with spring-damper pendulum physics, highlight on pointer hover, and open the specimen inspection modal when clicked.
14. **Verify responsive behavior:** Test at desktop (`1920×1080`) and mobile (`390×844`). Verify mobile disables shadow maps and post-processing, reduces DPR to `[1, 1.5]`, increases FOV to `50`, scales camera Z by `1.28x`, and halves geometry/foliage instance counts.
15. **Verify performance:** Ensure smooth frame pacing without WebGL context loss or React state thrashing during rapid forward and reverse scrolling.
16. **Fix issues (if any):** If any visual, shader, layout, or TypeScript issue is found, resolve it while strictly adhering to Section 4 (Non-Negotiable Design Requirements).
17. **Run static validation & production build:** Execute `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
18. **Verify production build:** Confirm `npm run build` exits with code `0` and generates `.next/` production artifacts cleanly.
19. **Commit changes:** Stage only intended source/documentation files (`git status`, `git add`), ensuring no secrets, `.next/`, or `node_modules/` are staged, and commit with a clear conventional commit message.
20. **Push to Git repository:** Push to `origin main` (`https://github.com/JohnsonJohn-del/arborea-3d-tree-experience.git`) and verify with `git status` and `git log -n 1`.

---

## 4. NON-NEGOTIABLE DESIGN REQUIREMENTS

### Tree (*Quercus robur* Ancient Oak)
- **Photorealistic Appearance:** Must look like a centuries-old, mature English Oak photographed in nature at golden hour—never a cartoon lollipop tree, low-poly cone, or symmetrical fractal toy.
- **Realistic Sapling (Stage 01):** Must display a biologically accurate germinating acorn nut, scaly cupule cap, radicle micro-roots, slender tapered stem (`0.0042m` base radius), apical bud, and 7 doubly-curved veined lobed oak leaves on petioles.
- **Very Thick Final Trunk & Root Flare:** Primary bole (`level = 0`) has `radiusStart = 1.06` (~2.12m diameter) multiplied by a basal root-flare curve (`1.0 + Math.pow(basalZone, 2.1) * 0.78`) and 6-lobed buttress fluting, plus 9 ground-hugging surface roots (`radiusStart = 0.40..0.52`) anchoring into the displaced soil mound.
- **Extensive Hierarchical Branching:**
  - 1 Main Ancient Bole (`y = -0.18m .. 5.15m`)
  - 3 Heavy Co-Dominant Crown Trunks forking at `y ≈ 2.6m` (`radiusStart = 0.48..0.56`)
  - 9 Juvenile Lateral Stem Shoots (`y = 0.55m .. 2.8m`, self-pruning at `uGrowth = 0.46..0.60`)
  - 5 Hero Story Boughs passing directly through the 5 `HangingCard` attachment knots
  - 20 Primary Crown Boughs (desktop) / 14 (mobile) starting at `heightRatio = 0.48` (`y ≈ 2.55m`) so the massive lower trunk and hanging cards remain unobstructed
  - 100 Secondary Branches (desktop) / 62 (mobile)
  - 160 Tertiary Crooked Twigs (desktop) / 42 (mobile)
- **Dense Foliage & Realistic Leaves:**
  - **2,796** (desktop) / **1,039** (mobile) 3D volumetric 3-plane intersecting twig-and-leaf spray clusters (`createVolumetricSprayGeometry()`, 22 veined oak leaves per spray texture).
  - **2,166** (desktop) / **794** (mobile) individual doubly-curved sculpted oak leaves (`createCurvedOakLeafGeometry()`).
  - **180** (desktop) / **90** (mobile) weathered fallen oak leaves scattered across the forest floor around the root flare.
- **Realistic Bark, Knots & Moss:** Multi-octave procedural furrow waves (`furrowFreq = 8.0` on trunk, `4.0` on branches), Gaussian burls/knots (`hasKnots: true`), vertex-colored crevice darkening (`#47382b`), sunlit ridges (`#f0e2d0`), basal moss (`#5c7d42` below `y = 1.35m`), and tiled PBR `/textures/oak-bark.jpg` albedo + bump mapping (`bumpScale = 0.11`).

### Camera Choreography (`src/components/experience/CameraController.tsx`)
- **Camera Parameters:** Perspective camera, `fov: 42` on desktop (`50` on mobile), `near: 0.02`, `far: 65`.
- **Phase 1 — Growth Spline (`scrollProgress` `0.00 -> 0.71`):** Interpolates along two 6-point `THREE.CatmullRomCurve3` splines (`mobileZScale = isMobile ? 1.28 : 1.0`):
  1. `0.00` (Microscopic Sapling): Position `[0.0, 0.32, 0.68 * mobileZScale]` → Target `[0.0, 0.16, 0.0]`
  2. `0.14` (Macro Sapling): Position `[0.18, 0.42, 1.22 * mobileZScale]` → Target `[0.0, 0.28, 0.0]`
  3. `0.28` (Close Stem): Position `[-0.65, 1.35, 3.1 * mobileZScale]` → Target `[0.0, 1.25, 0.0]`
  4. `0.42` (Medium Young Tree): Position `[1.25, 2.85, 7.6 * mobileZScale]` → Target `[0.0, 2.75, 0.0]`
  5. `0.56` (Wide Emerging Crown): Position `[-0.4, 3.85, 17.5 * mobileZScale]` → Target `[0.0, 3.65, 0.0]`
  6. `0.71` (Ultra-Wide Full Tree): Position `[0.0, 3.95, 20.8 * mobileZScale]` → Target `[0.0, 3.70, 0.0]`
- **Phase 2 — Branch Exploration (`scrollProgress` `0.71 -> 0.948`):**
  - Each branch window (`localT` in `[0, 1]`) transitions in 3 sub-segments:
    - Approach (`localT < 0.28`): Two-stage arc from `prevApproach` through `midArc` (`prevApproach.lerp(approachPos, 0.65)`) into `cardCamPos`, while target shifts through `[0, 3.5, 0]` to `cardTarget` (with desktop `mobileCardXShift = -0.22` to frame the 3D card alongside the right-side HUD plaque).
    - Inspection Hold (`0.28 <= localT <= 0.80`): Holds at `cardCamPos` with subtle horizontal parallax drift `desiredPos.x += (holdT - 0.5) * 0.14`.
    - Departure (`localT > 0.80`): Smoothly interpolates toward `nextApproach`.
- **Phase 3 — Finale Pullback (`scrollProgress` `0.948 -> 1.00`):**
  - Interpolates from `[0.0, 4.2, 10.2]` (mobile `z = 12.5`) to `[0.0, 3.95, 21.2]` (mobile `z = 26.2`), target `[0.0, 3.70, 0.0]`.
- **Easing & Damping:** Per-frame exponential damping (`lerpFactor = reducedMotion ? 0.28 : 0.09`) plus distance-scaled pointer parallax and sinusoidal breathing (`distScale = clamp(desiredPos.length() * 0.028, 0.02, 0.26)`).

### Scroll System (`src/hooks/useScrollProgress.ts` & `src/hooks/useExperienceTimeline.ts`)
- **Scroll Container:** Native window scroll over `<main className="relative min-h-[1150vh] ...">`. No scroll-hijacking library is used, ensuring native trackpad/touch compatibility.
- **Damping & Inertia:** `requestAnimationFrame` loop updates `smoothProgress += (targetProgress - smoothProgress) * damping` where `damping = reducedMotion ? 0.35 : 0.075`, and `velocity = delta * 18` (decaying by `0.85` when idle).
- **React UI Throttling:** `uiProgress` and `uiVelocity` React states update at most once every `48ms` (~20Hz) and only when `|prev - smoothProgress| > 0.0008`, keeping React DOM reconciliation near zero while Three.js reads `scrollRef.current.smoothProgress` directly at 60fps.
- **Reverse & Fast Scroll:** Because `computeTimelineSnapshot(scrollProgress, scrollVelocity)` and all vertex/instance transformations are pure functions of `smoothProgress`, scrolling backward smoothly reverses tree growth (re-growing pruned juvenile shoots and shrinking adult boughs back into the stem and sapling), and fast scrolling glides smoothly through all intermediate states via the `0.075` damping factor without skipping or breaking state.

### Branches & Hanging Cards (`src/data/branches.ts` & `src/components/experience/HangingCard.tsx`)
All 5 branches are deterministically wired to Hero Boughs and 3D Hanging Cards:
1. **`branch-01` ("The Silent Genesis"):** Scroll `[0.71, 0.758]`, Attachment `[2.35, 3.15, 1.65]`, Card `[2.35, 2.45, 1.65]`, Approach `[5.8, 3.6, 6.8]`, CamPos `[1.98, 2.42, 3.45]`, Target `[2.35, 2.48, 1.65]`, Accent `#78c88a`.
2. **`branch-02` ("Rings of Patience"):** Scroll `[0.758, 0.806]`, Attachment `[-2.65, 4.1, 1.4]`, Card `[-2.65, 3.4, 1.4]`, Approach `[-5.4, 4.4, 6.2]`, CamPos `[-2.2, 3.38, 3.18]`, Target `[-2.65, 3.42, 1.4]`, Accent `#e5b869`.
3. **`branch-03` ("The Unseen Network"):** Scroll `[0.806, 0.854]`, Attachment `[-1.85, 5.15, -2.15]`, Card `[-1.85, 4.45, -2.15]`, Approach `[-5.2, 5.2, 1.2]`, CamPos `[-0.65, 4.42, -0.72]`, Target `[-1.85, 4.48, -2.15]`, Accent `#d49b4b`.
4. **`branch-04` ("Crown of Alchemy"):** Scroll `[0.854, 0.902]`, Attachment `[2.55, 5.65, -1.45]`, Card `[2.55, 4.95, -1.45]`, Approach `[5.8, 5.6, 2.4]`, CamPos `[1.62, 4.92, 0.12]`, Target `[2.55, 4.98, -1.45]`, Accent `#c9d876`.
5. **`branch-05` ("Seeds of Tomorrow"):** Scroll `[0.902, 0.948]`, Attachment `[0.25, 6.25, 2.25]`, Card `[0.25, 5.55, 2.25]`, Approach `[2.8, 6.2, 6.4]`, CamPos `[0.12, 5.52, 4.08]`, Target `[0.25, 5.58, 2.25]`, Accent `#f0cf85`.

### Final Scene (`FULL_TREE_FINALE`, Scroll `0.948 – 1.00`)
- Full mature Ancient Oak (`treeGrowth = 1.0`) with thick fluted trunk, 9 surface roots, dense multi-tiered green canopy, 5 suspended cards gently swaying in the breeze, golden-hour directional lighting (`intensity = 4.05`), interior crown glow (`intensity = 3.2`), shimmering volumetric god-rays (`opacity ≈ 0.067`), exponential obsidian-green fog (`#070a07`, `density = 0.018`), and ultra-wide camera framing (`[0.0, 3.95, 21.2]`).

---

## 5. VERIFIED TECHNICAL PARAMETERS (NO INVENTED INFORMATION)

Every value below was inspected directly from the repository and active environment:

| Parameter | Verified Value | Source |
| :--- | :--- | :--- |
| **Project Name** | `immersive-3d-tree-growth` (`v1.0.0`) | `package.json` |
| **Node.js Version** | `v24.11.0` (types: `@types/node: ^20.16.10`) | `node -v` / `package.json` |
| **Package Manager** | `npm` `11.6.1` (`package-lock.json` lockfileVersion 3) | `npm -v` / `package-lock.json` |
| **Framework** | `next` `14.2.16` (App Router) | `package.json` |
| **React Version** | `react` `^18.3.1`, `react-dom` `^18.3.1` | `package.json` |
| **Three.js Version** | `three` `^0.169.0` (`@types/three` `^0.169.0`) | `package.json` |
| **React Three Fiber** | `@react-three/fiber` `^8.17.10` | `package.json` |
| **Drei Helpers** | `@react-three/drei` `^9.114.0` | `package.json` |
| **Post-Processing** | `@react-three/postprocessing` `^2.16.3`, `postprocessing` `^6.36.3` | `package.json` |
| **Styling** | `tailwindcss` `^3.4.14`, `postcss` `^8.4.47`, `autoprefixer` `^10.4.20` | `package.json` |
| **TypeScript** | `typescript` `^5.6.3` | `package.json` |
| **Git Version** | `git version 2.51.0.windows.2` | `git --version` |
| **Git Remote (`origin`)** | `https://github.com/JohnsonJohn-del/arborea-3d-tree-experience.git` | `git remote -v` |
| **Default / Active Branch** | `main` | `git branch` |
| **Environment Variables** | None required (`.env` not needed) | Repository inspection |
| **External API Requirements** | Google Fonts (`Cormorant Garamond`, `Plus Jakarta Sans`, `JetBrains Mono`) fetched at build time by `next/font/google` | `src/app/layout.tsx` |
| **Runtime Asset Paths** | `/textures/oak-bark.jpg`, `/textures/forest-soil.jpg`, `/images/branches/branch-01.jpg`..`branch-05.jpg`, `src/app/icon.svg` | `public/` & `src/app/` |
| **Build & Run Commands** | `npm run dev`, `npm run build`, `npm run start`, `npm run lint` | `package.json` |
| **Formal Hardware / GPU Benchmarks** | **UNKNOWN — requires verification** (formally verified on Windows 11 development machine via headless & interactive Chromium WebGL2; minimum hardware specs in File 03 are marked as estimated) | Environment inspection |
