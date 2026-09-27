# 04 — TECHNICAL HANDOFF, SKILLS, ASSETS & ARCHITECTURAL DECISIONS

This document is the final technical handoff record for **ARBOREA (`immersive-3d-tree-growth`)**, documenting the exact project state, architecture, AI/engineering skills used, AI-generated assets with exact prompts, architectural decisions, known limitations, and Git repository handoff verification.

---

## 1. HANDOFF SUMMARY

| Field | Verified Value |
| :--- | :--- |
| **Project** | ARBOREA — Immersive 3D Tree Growth Experience (`immersive-3d-tree-growth` `v1.0.0`) |
| **Current Status** | **Complete & Production-Ready** (All 4 growth stages, 5-branch exploration, 3D hanging archival cards, Web Audio synthesis, responsive mobile/desktop adaptation, and realistic *Quercus robur* redesign verified) |
| **Repository** | `https://github.com/JohnsonJohn-del/arborea-3d-tree-experience` |
| **Clone URL** | `https://github.com/JohnsonJohn-del/arborea-3d-tree-experience.git` |
| **Branch** | `main` |
| **Initial Code Commit** | `0017054` (`feat: immersive 3d ancient oak tree growth experience`) |
| **Last Verified Commit** | `97bbc72` (`docs: add complete project walkthrough and handoff documentation`) |
| **Development Server** | Verified on `http://localhost:3000` (`npm run dev -- -p 3000`) and via Cloudflare quick tunnel |
| **Production Build** | Verified passing (`npm run build` exits with `0`; `/` static route `17.2 kB`, First Load JS `105 kB`) |
| **Known Issues** | Zero runtime, TypeScript, ESLint, or build errors. CPU-driven per-frame `InstancedMesh` matrix updates in `TreeModel.tsx` (~4,962 instances on desktop) could be moved to GPU vertex attributes if targeting older low-end mobile devices. |
| **Remaining Work** | None required for current scope. Optional future enhancements include moving foliage instance animation to a GPU vertex shader and removing unused `gsap` / `framer-motion` entries from `package.json`. |

---

## 2. ARCHITECTURE SUMMARY

```
Next.js 14.2.16 (App Router) — src/app/layout.tsx & src/app/page.tsx
   │
   ├── Scroll & Timeline Engine
   │     ├── useReducedMotion.ts         (Tracks prefers-reduced-motion & manual Calm Motion toggle)
   │     ├── useScrollProgress.ts        (60fps RAF damped scrollRef + 48ms throttled React state)
   │     └── useExperienceTimeline.ts    (Pure state machine: computeTimelineSnapshot [0..1])
   │
   ├── Accessible React HUD Overlays (z-20 / z-30 / z-50)
   │     ├── Navigation.tsx              (Brand mark, live LENS scale pill, 6 stage waypoints, Audio & Motion toggles)
   │     ├── ProgressIndicator.tsx       (Left vertical progress rail, biomass %, bottom stage caption card)
   │     ├── BranchIndicator.tsx         (BRANCH 01/05 selector, right-side companion plaque, full-screen Specimen Modal)
   │     └── Finale Hero Overlay         (Appears when finaleFactor > 0.35; "Everything Starts Small.")
   │
   └── Dynamic Client WebGL World (ssr: false) — src/components/experience/TreeScene.tsx
          │
          ├── AudioTimelineSync          ──► src/lib/audioEngine.ts (Web Audio pink-noise wind + D-major drone + chimes)
          │
          ├── CameraController.tsx       (Catmull-Rom growth spline [0..0.71], 5 branch orbital arcs [0.71..0.948], Finale pullback)
          │
          ├── Environment.tsx            (FogExp2 #070a07, HemisphereLight, 2048² Shadow KeyLight, Fill/Rim/Crown lights, 3 God-Ray planes)
          │
          ├── TreeGrowth.tsx             (Displaced 42m×42m forest-soil.jpg floor + 260 instanced 3D soil/moss clods)
          │     │
          │     └── TreeModel.tsx        (The Living Quercus robur Ancient Oak)
          │           ├── Stage 01 Macro Seedling Group (Acorn nut, cupule cap, radicle roots, tapered stem, 7 veined leaves)
          │           ├── Unified GPU Bark Mesh         (src/lib/treeGenerator.ts + src/shaders/treeShaders.ts + oak-bark.jpg)
          │           ├── Instanced Volumetric Sprays   (2,796 3-plane twig clusters + src/lib/botanicalTextures.ts)
          │           ├── Instanced Close-Up Leaves     (2,166 doubly-curved veined oak leaves)
          │           └── Instanced Fallen Floor Leaves (180 weathered oak leaves on root mound)
          │
          ├── BranchExplorer.tsx
          │     └── 5 × HangingCard.tsx  (Brass torus ring, cord, bronze/gold frame, branch-01..05.jpg + Canvas2D letterpress plaque)
          │
          ├── ParticleSystem.tsx         (240 rising microscopic spores + 480 canopy golden dust/pollen motes)
          │
          └── EffectComposer (Desktop)   (Bloom luminanceThreshold=0.82 + Vignette darkness=0.72)
```

---

## 3. ALL SKILLS & TOOLS ACTUALLY USED

### 3.1 Antigravity Agent Skills Loaded & Applied
During the execution of this project, the following five specialized agent skills were explicitly loaded via `view_file` from the local skill library (`C:\Users\My Document\.gemini\config\skills\`) and followed:
1. **`premium-3d-website`**: Guided the single continuous 3D world architecture, scroll-to-timeline choreography, camera spline framing, and restrained glassmorphic HUD hierarchy.
2. **`frontend-design`**: Guided editorial typography pairing (`Cormorant Garamond` display serif + `Plus Jakarta Sans` + `JetBrains Mono` telemetry), dark forest obsidian/gold palette, and non-generic archival aesthetics.
3. **`super-code`**: Enforced dense, strictly typed, idiomatic TypeScript/React/Three.js code without bloat or dead abstractions.
4. **`lint-and-validate`**: Enforced running `npx tsc --noEmit` and `npm run lint` after every code modification until zero warnings/errors remained.
5. **`github`**: Guided repository initialization, `.gitignore` verification, and remote push workflows.

### 3.2 Engineering & Creative Capabilities Used
- **Web Development:** Next.js 14 App Router, React 18 hooks, TypeScript 5.6, Tailwind CSS 3.4, responsive layout design (`< 768px` mobile adaptation), WCAG keyboard & screen-reader accessibility (`sr-only`, `aria-live`, modal dialog management).
- **Web 3D & Graphics:** Three.js (`r169`), React Three Fiber (`v8`), `@react-three/drei` (`useTexture`), `@react-three/postprocessing` (`Bloom`, `Vignette`), custom GLSL vertex/fragment shader injection (`onBeforeCompile` on `MeshStandardMaterial` and `MeshDepthMaterial`), procedural `CatmullRomCurve3` Frenet-frame tube generation, `InstancedMesh` rendering, and procedural Canvas2D normal/albedo map synthesis.
- **Audio & Physics Simulation:** Web Audio API procedural synthesis (Paul Kellet pink-noise filtering, multi-oscillator harmonic drones, pentatonic chimes) and 2-axis spring-damper pendulum physics for 3D hanging cards.
- **AI Asset Generation & Browser Verification Tools:**
  - Google Gemini `generate_image` tool (used to generate 5 fine-art botanical branch photographs, 2 seamless PBR macro textures for oak bark and forest soil, and 1 target reference image).
  - `chrome-devtools-mcp` (used to drive a real Chromium browser, scroll through every stage `0% -> 100%`, inspect WebGL rendering at `1920×1080` and `390×844`, verify zero console errors, and capture verification screenshots).

---

## 4. SKILL & TECHNOLOGY LINKS TABLE

Every entry below reflects actual usage verified against the project transcript and codebase:

| Skill / Technology | Used For | Actual Skill URI / Official Documentation Link | Actually Used? |
| :--- | :--- | :--- | :--- |
| **`premium-3d-website` (Skill)** | Continuous 3D WebGL world & scroll choreography architecture | `file:///C:/Users/My%20Document/.gemini/config/skills/premium-3d-website/SKILL.md` | **Yes** |
| **`frontend-design` (Skill)** | Editorial typography, color tokens, and luxury archival UI design | `file:///C:/Users/My%20Document/.gemini/config/skills/frontend-design/SKILL.md` | **Yes** |
| **`super-code` (Skill)** | Dense, idiomatic TypeScript & Three.js implementation standards | `file:///C:/Users/My%20Document/.gemini/config/skills/super-code/SKILL.md` | **Yes** |
| **`lint-and-validate` (Skill)** | Mandatory TypeScript (`tsc`) and ESLint validation gates | `file:///C:/Users/My%20Document/.gemini/config/skills/lint-and-validate/SKILL.md` | **Yes** |
| **`github` (Skill)** | Git repository creation and push workflow | `file:///C:/Users/My%20Document/.gemini/config/skills/github/SKILL.md` | **Yes** |
| **Three.js (`^0.169.0`)** | Core 3D WebGL rendering, `BufferGeometry`, `InstancedMesh`, splines, PBR materials, lights | https://threejs.org/docs/ | **Yes** |
| **React Three Fiber (`^8.17.10`)** | Declarative React reconciler for Three.js scene graph & `useFrame` loop | https://r3f.docs.pmnd.rs/ | **Yes** |
| **`@react-three/drei` (`^9.114.0`)** | `useTexture` hook for loading PBR bark, soil, and branch photographs | https://drei.docs.pmnd.rs/ | **Yes** |
| **`@react-three/postprocessing` (`^2.16.3`)** | Desktop `EffectComposer`, `Bloom`, and `Vignette` passes | https://react-postprocessing.docs.pmnd.rs/ | **Yes** |
| **WebGL 2.0 / GLSL** | Custom vertex/fragment shader injection in `src/shaders/treeShaders.ts` | https://www.khronos.org/webgl/ | **Yes** |
| **Next.js (`14.2.16`)** | React framework, App Router, `next/dynamic`, `next/font/google`, static build | https://nextjs.org/docs | **Yes** |
| **React (`^18.3.1`)** | UI components, state hooks, refs, and custom timeline hooks | https://react.dev/ | **Yes** |
| **TypeScript (`^5.6.3`)** | Static typing across all 22 source files in `src/` | https://www.typescriptlang.org/docs/ | **Yes** |
| **Tailwind CSS (`^3.4.14`)** | Styling for HUD overlays, modals, and responsive breakpoints | https://tailwindcss.com/docs | **Yes** |
| **Lucide React (`^0.454.0`)** | UI vector icons in Navigation, ProgressIndicator, and BranchIndicator | https://lucide.dev/ | **Yes** |
| **Web Audio API** | Procedural wind, botanical drone, and branch harmonic chimes (`audioEngine.ts`) | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API | **Yes** |
| **HTML5 Canvas 2D API** | Procedural oak leaf/spray diffuse & normal maps (`botanicalTextures.ts`) and card plaques | https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D | **Yes** |
| **Google Gemini (`generate_image`)** | Generating 5 branch photographs, 2 PBR textures, and 1 oak reference image | Built-in Antigravity `generate_image` tool | **Yes** |
| **`chrome-devtools-mcp`** | Live browser inspection, scroll evaluation, console verification, and screenshots | `C:\Users\My Document\.gemini\antigravity\mcp\chrome-devtools-mcp` | **Yes** |
| **Cloudflare Quick Tunnel (`cloudflared`)** | Exposing `http://localhost:3000` via public HTTPS preview URL | https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/ | **Yes** |
| **GSAP (`^3.12.5`)** | Installed in `package.json` during initial scaffolding, but replaced by native R3F `useFrame` math | https://gsap.com/docs/v3/ | **No** *(In `package.json` only)* |
| **Framer Motion (`^11.11.17`)** | Installed in `package.json` during initial scaffolding, but replaced by native CSS/R3F transitions | https://www.framer.com/motion/ | **No** *(In `package.json` only)* |
| **External `.gltf` / `.glb` Models** | Not used; tree and leaves are 100% procedural + shader-driven | N/A | **No** |

---

## 5. AI-GENERATED ASSETS

All 8 image assets in `public/` were generated during this project using the Antigravity `generate_image` tool (powered by Google Gemini image generation) and copied into the repository:

### 5.1 Branch 01 Photograph — `public/images/branches/branch-01.jpg`
- **Generator:** Antigravity `generate_image` (`ImageName: "branch_01_genesis"`, `AspectRatio: "3:4"`)
- **Exact Prompt:** `"Museum-grade fine art macro photography of a single luminous sprouting botanical seed emerging from dark volcanic mineral soil, delicate emerald green shoot unfurling with microscopic morning dewdrops, warm golden chiaroscuro rim lighting against a deep obsidian forest background, shallow depth of field, shot on Hasselblad medium format, luxury editorial botanical aesthetic, no text, no watermarks."`
- **Purpose:** Upper photographic print on Branch 01 `HangingCard` (*"The Silent Genesis"*) and full-screen inspection modal.
- **Format & Size:** JPEG, `685,802` bytes.
- **Where Stored:** `public/images/branches/branch-01.jpg` (Artifact origin: `branch_01_genesis_1790410419203.jpg`).
- **Post-Processing / Optimization:** Loaded with `THREE.SRGBColorSpace` and `anisotropy = 4`.

### 5.2 Branch 02 Photograph — `public/images/branches/branch-02.jpg`
- **Generator:** Antigravity `generate_image` (`ImageName: "branch_02_vascular"`, `AspectRatio: "3:4"`)
- **Exact Prompt:** `"Museum-grade fine art close-up photography of ancient sculpted tree bark and cross-section growth rings infused with subtle veins of warm liquid amber and gold light, deep charcoal and moss tones, dramatic directional studio lighting, tactile organic texture, shot on Hasselblad medium format, luxury botanical installation aesthetic, no text, no watermarks."`
- **Purpose:** Upper photographic print on Branch 02 `HangingCard` (*"Rings of Patience"*) and modal.
- **Format & Size:** JPEG, `992,007` bytes.
- **Where Stored:** `public/images/branches/branch-02.jpg` (Artifact origin: `branch_02_vascular_1790410433578.jpg`).
- **Post-Processing / Optimization:** Loaded with `THREE.SRGBColorSpace` and `anisotropy = 4`.

### 5.3 Branch 03 Photograph — `public/images/branches/branch-03.jpg`
- **Generator:** Antigravity `generate_image` (`ImageName: "branch_03_symbiosis"`, `AspectRatio: "3:4"`)
- **Exact Prompt:** `"Museum-grade fine art photography of intricate ancient tree roots interweaving through dark velvet forest moss and obsidian soil, delicate glowing golden-amber mycelial threads connecting the roots underground, subtle atmospheric mist, chiaroscuro lighting, shot on Hasselblad medium format, luxury botanical installation aesthetic, no text, no watermarks."`
- **Purpose:** Upper photographic print on Branch 03 `HangingCard` (*"The Unseen Network"*) and modal.
- **Format & Size:** JPEG, `971,735` bytes.
- **Where Stored:** `public/images/branches/branch-03.jpg` (Artifact origin: `branch_03_symbiosis_1790410462446.jpg`).
- **Post-Processing / Optimization:** Loaded with `THREE.SRGBColorSpace` and `anisotropy = 4`.

### 5.4 Branch 04 Photograph — `public/images/branches/branch-04.jpg`
- **Generator:** Antigravity `generate_image` (`ImageName: "branch_04_canopy"`, `AspectRatio: "3:4"`)
- **Exact Prompt:** `"Museum-grade fine art photography looking upward into a majestic ancient tree branch canopy, translucent deep emerald and warm champagne-gold leaves catching volumetric sunbeams and fine floating dust motes against a dark twilight charcoal background, shot on Hasselblad medium format, luxury editorial aesthetic, no text, no watermarks."`
- **Purpose:** Upper photographic print on Branch 04 `HangingCard` (*"Crown of Alchemy"*) and modal.
- **Format & Size:** JPEG, `1,259,017` bytes.
- **Where Stored:** `public/images/branches/branch-04.jpg` (Artifact origin: `branch_04_canopy_1790410481259.jpg`).
- **Post-Processing / Optimization:** Loaded with `THREE.SRGBColorSpace` and `anisotropy = 4`.

### 5.5 Branch 05 Photograph — `public/images/branches/branch-05.jpg`
- **Generator:** Antigravity `generate_image` (`ImageName: "branch_05_legacy"`, `AspectRatio: "3:4"`)
- **Exact Prompt:** `"Museum-grade fine art macro photography of an elegant botanical seed pod on a gnarled dark branch releasing delicate golden-rimmed winged samara seeds floating into a misty dark forest night with warm volumetric light particles, shot on Hasselblad medium format, luxury editorial botanical aesthetic, no text, no watermarks."`
- **Purpose:** Upper photographic print on Branch 05 `HangingCard` (*"Seeds of Tomorrow"*) and modal.
- **Format & Size:** JPEG, `693,032` bytes.
- **Where Stored:** `public/images/branches/branch-05.jpg` (Artifact origin: `branch_05_legacy_1790410494202.jpg`).
- **Post-Processing / Optimization:** Loaded with `THREE.SRGBColorSpace` and `anisotropy = 4`.

### 5.6 Seamless Ancient Oak Bark PBR Texture — `public/textures/oak-bark.jpg`
- **Generator:** Antigravity `generate_image` (`ImageName: "oak_bark_texture"`, `AspectRatio: "1:1"`)
- **Exact Prompt:** `"Seamless tileable photorealistic macro texture of ancient oak tree bark, deep vertical fissures, rugged weathered wood ridges, natural dark gray-brown and umber tones with subtle hints of dark green forest moss tucked deep inside the bark crevices, flat even lighting for 3D PBR material texture map, ultra-sharp surface detail, no text, no background."`
- **Purpose:** Primary diffuse (`map`) and relief (`bumpMap`, `bumpScale: 0.11`) texture across the entire procedural oak trunk, root flare, boughs, acorn nut, cupule cap, and seedling stem.
- **Format & Size:** JPEG, `1,148,941` bytes.
- **Where Stored:** `public/textures/oak-bark.jpg` (Artifact origin: `oak_bark_texture_1790413046228.jpg`).
- **Post-Processing / Optimization:** Configured with `THREE.RepeatWrapping`, `THREE.SRGBColorSpace`, `anisotropy = 8`, and modulated by per-vertex crevice/ridge/moss vertex colors.

### 5.7 Seamless Forest Floor Humus & Moss PBR Texture — `public/textures/forest-soil.jpg`
- **Generator:** Antigravity `generate_image` (`ImageName: "forest_soil_texture"`, `AspectRatio: "1:1"`)
- **Exact Prompt:** `"Seamless tileable photorealistic top-down macro texture of rich dark forest floor humus soil, fine organic earth granules, tiny decayed twig fragments, dark velvet moss patches, and small mineral grains, natural even lighting for 3D PBR ground texture, ultra-detailed, no text."`
- **Purpose:** Diffuse (`map`) and bump (`bumpMap`, `bumpScale: 0.035`) texture for the 42m×42m displaced forest floor clearing and the 260 instanced 3D soil/moss granules.
- **Format & Size:** JPEG, `1,244,827` bytes.
- **Where Stored:** `public/textures/forest-soil.jpg` (Artifact origin: `forest_soil_texture_1790413059850.jpg`).
- **Post-Processing / Optimization:** Configured with `THREE.RepeatWrapping` (`repeat.set(28, 28)`), `THREE.SRGBColorSpace`, `anisotropy = 8`, and radial vertex-color falloff to `#000000` at the clearing perimeter.

### 5.8 Visual Benchmark Reference — `public/textures/target-oak-reference.jpg`
- **Generator:** Antigravity `generate_image` (`ImageName: "target_ancient_oak_reference"`, `AspectRatio: "4:3"`)
- **Exact Prompt:** `"Photorealistic nature photography of a monumental, centuries-old ancient oak tree standing on a mossy forest clearing at golden hour, extremely thick gnarled trunk with wide root flare buttresses, deeply fissured weathered bark, massive twisting primary boughs, hundreds of smaller branches and twigs, and an extraordinarily dense, lush, irregular deep green leaf canopy with natural sunlight filtering through the leaves, shot on medium format camera, realistic natural colors, no text."`
- **Purpose:** Visual target reference used during the realistic tree redesign to calibrate trunk-to-canopy proportions, basal root flare, and golden-hour leaf illumination.
- **Format & Size:** JPEG, `1,312,881` bytes.
- **Where Stored:** `public/textures/target-oak-reference.jpg` (Artifact origin: `target_ancient_oak_reference_1790413035222.jpg`).

---

## 6. RESEARCH SOURCES & DESIGN REFERENCES

### 6.1 User-Provided Specifications & Visual References
1. **Master Architectural Specification (`media_1790410267695.txt`):**
   - **Source:** Uploaded by user at project inception (`C:\Users\My Document\.gemini\antigravity\brain\5124d555-be38-4902-ab40-f83673b1886d\.user_uploaded\media_1790410267695.txt`).
   - **What Was Learned & How It Influenced Implementation:** Defined the complete 6-stage state machine (`SAPLING`, `STEM`, `YOUNG_TREE`, `FULL_TREE`, `BRANCH_APPROACH`/`BRANCH_CARD`/`NEXT_BRANCH`, `FULL_TREE_FINALE`), the file tree layout (`src/components/experience/*`, `src/components/ui/*`, `src/hooks/*`, `src/data/*`), the physical 3D hanging cards requirement, and the finale copy (*"Everything Starts Small."*).
2. **Realistic Tree Redesign Critique & Reference Image (`media_1790412833752.jpg`):**
   - **Source:** Uploaded by user (`C:\Users\My Document\.gemini\antigravity\brain\5124d555-be38-4902-ab40-f83673b1886d\.user_uploaded\media_1790412833752.jpg`) alongside the `REALISTIC TREE REDESIGN` prompt.
   - **What Was Learned & How It Influenced Implementation:** Demonstrated that the initial prototype looked too stylized/cartoonish and established the target botanical morphology: a realistic germinating oak seedling for Stage 01 and a massive, gnarled, deeply fissured *Quercus robur* pasture oak with dense lobed foliage for Stage 04.

### 6.2 Technical & Botanical References
3. **Three.js `MeshStandardMaterial` Shader Chunk Architecture (`r169`):**
   - **URL:** https://threejs.org/docs/#api/en/materials/Material.onBeforeCompile
   - **Purpose & Influence:** Enabled injecting radial biological growth (`aSpinePos`, `aBirth`, `aMature`, `aPrune`) directly into `#include <begin_vertex>` and `#include <clipping_planes_fragment>` so native Three.js PBR bump mapping, sRGB texture decoding, directional shadow maps, and fog remained 100% intact.
4. **Paul Kellet's Instrumentation-Grade Pink Noise Algorithm:**
   - **URL:** https://www.firstpr.com.au/dsp/pink-noise/
   - **Purpose & Influence:** Used in `src/lib/audioEngine.ts` (lines 46–57) to synthesize organic 1/f pink noise filtered through a dynamic `BiquadFilterNode` bandpass filter (`320Hz` base frequency modulated by scroll velocity) to create natural wind-through-leaves acoustics without external audio files.
5. **Botanical Morphology of *Quercus robur* (Pedunculate / English Oak):**
   - **Purpose & Influence:** Informed the 4-lobed bezier leaf silhouette and venation in `src/lib/botanicalTextures.ts`, the spiral phyllotaxy (`137.5°` / `2.39996 rad` golden angle) in `src/lib/treeGenerator.ts`, the hypogeal acorn germination anatomy in `src/components/experience/TreeModel.tsx`, and ontogenetic self-pruning of shaded lower juvenile shoots (`pruneAt = 0.46`).

---

## 7. IMPORTANT ARCHITECTURAL DECISIONS

### Decision 1: Hybrid Procedural Spline Geometry + Custom GLSL Shader + PBR Textures (Instead of Static `.glb` Model)
- **Reason:** A static `.glb` tree model cannot continuously grow from a 4mm-thick seedling stem into a 2.12m-diameter gnarled oak trunk, unfurl 303 individual branches at staggered scroll intervals, and self-prune juvenile lower shoots without unnatural rigid scaling or morph-target vertex explosions.
- **Alternatives Considered:** Loading 4 separate static `.glb` meshes and cross-fading opacity between stages.
- **Why This Approach Was Selected:** Cross-fading static meshes breaks the illusion of continuous biological growth. By generating a unified hierarchical tube mesh (`treeGenerator.ts`) with per-vertex `aSpinePos`, `aBirth`, `aMature`, and `aPrune` attributes and displacing vertices radially on the GPU (`treeShaders.ts`), every single branch grows smoothly from its parent bough's core and thickens organically at 60fps.
- **Trade-offs:** Requires `frustumCulled={false}` on the unified bark mesh because vertex positions are displaced dynamically in the vertex shader.

### Decision 2: Dual-Stage Botanical Representation (Dedicated Macro Seedling + Unified Adult Oak)
- **Reason:** At `scrollProgress = 0.0` (`camera.position = [0, 0.32, 0.68]`), the camera is only 68cm away from the origin. A mesh resolution suitable for a 10m-tall adult tree looks coarse at 68cm, whereas a delicate seedling stem with an acorn nut, cupule cap, and 7 petiole-mounted leaves provides true macro photorealism.
- **Why This Approach Was Selected:** `TreeModel.tsx` renders the high-detail `saplingGroupRef` during Stage 01 (`smoothProgress < 0.23`) while the main GPU trunk (`level = 0`, `aBirth = 0.05`) swells upward inside the seedling stem, seamlessly taking over just as the camera pulls back into Stage 02.
- **Trade-offs:** Slightly increases initial scene graph node count (~20 extra small meshes for the acorn and 7 sapling leaves), which are hidden (`visible = false`) once `smoothProgress >= 0.23`.

### Decision 3: Native Window Scroll + Custom 60fps RAF Damping (Instead of Scroll-Hijacking Libraries)
- **Reason:** Scroll-hijacking libraries (such as Locomotive Scroll or heavy GSAP ScrollTrigger pinning) frequently cause jitter on macOS trackpads, mobile touch screens, and accessibility screen readers.
- **Why This Approach Was Selected:** `useScrollProgress.ts` uses passive native `window` scroll listeners over a `1150vh` container, updating a mutable ref (`scrollRef.current.smoothProgress`) at 60fps for WebGL while throttling React UI state updates (`uiProgress`) to `>= 48ms` intervals.
- **Trade-offs:** Custom damping math (`damping = 0.075`) must be tuned carefully so both small wheel ticks and large waypoint jumps feel responsive.

### Decision 4: 3-Plane Intersecting Volumetric Twig-Spray Clusters + Doubly-Curved Individual Leaves
- **Reason:** Flat single-plane billboard leaf cards look paper-thin and artificial when the camera orbits through the canopy during Stage 05 Branch Exploration.
- **Why This Approach Was Selected:** `createVolumetricSprayGeometry()` intersects three curved planes at `0°`, `120°`, and `240°` with a `512×512` 22-leaf botanical twig texture (`botanicalTextures.ts`), while `createCurvedOakLeafGeometry()` adds 2,166 doubly-curved single leaves along close-up branches.
- **Trade-offs:** 3× vertex count per spray instance compared to a single quad, mitigated by `THREE.InstancedMesh` and mobile instance reduction (`0.48×`).

### Decision 5: Custom `MeshDepthMaterial` Shader Injection (`customDepthMaterial`)
- **Reason:** When a Three.js mesh is deformed in a vertex shader (`onBeforeCompile`) and clipped with `discard` in the fragment shader, Three.js's default shadow map pass still renders the un-deformed full mature tree geometry into the shadow buffer—causing the full adult tree's shadow to appear on the ground during Stage 01!
- **Why This Approach Was Selected:** Creating `barkDepthMaterial` (`THREE.MeshDepthMaterial` with `RGBADepthPacking`) and applying the exact same `applyBarkGrowthShader()` hook via `customDepthMaterial={barkDepthMaterial}` ensures the real-time shadow on the forest floor grows and self-prunes in exact synchronization with the visible tree.

---

## 8. KNOWN LIMITATIONS

1. **CPU-Driven Foliage Instance Matrix Updates:** In `src/components/experience/TreeModel.tsx`, `useFrame` iterates over `sprayClusters` (`2,796` desktop / `1,039` mobile) and `individualLeaves` (`2,166` desktop / `794` mobile) on the CPU each frame to compute `dummy.updateMatrix()` and upload `instanceMatrix`. While fast on modern hardware (~1ms/frame), very old mobile devices could experience CPU bottlenecks during rapid scrolling.
2. **Disabled Frustum Culling on Growing Meshes:** `frustumCulled={false}` is set on the bark mesh and foliage `InstancedMesh` nodes so Three.js does not prematurely cull branches whose bounding spheres are modified by `uGrowth` or wind sway.
3. **Unused Packages in `package.json`:** `gsap` (`^3.12.5`) and `framer-motion` (`^11.11.17`) are present in `package.json` from initial setup but are not imported in `src/`. Because Next.js tree-shakes unused packages, they do not bloat the `105 kB` First Load JS bundle, but they slightly increase `node_modules` install time.
4. **Unused Reference Image in `public/textures/`:** `public/textures/target-oak-reference.jpg` (`1.31 MB`) is stored in `public/textures/` as an art-direction reference artifact; it is not referenced by runtime code.
5. **Browser WebGL2 Requirement:** The experience requires a browser and GPU with hardware-accelerated WebGL 2.0 enabled. No 2D static fallback tree image is rendered if WebGL is completely disabled in the browser (though the full semantic text narrative remains available in DOM via `.sr-only` and HUD overlays).

---

## 9. NEXT DEVELOPER CHECKLIST

- [ ] Read `01_ANTIGRAVITY_EXECUTION_PROMPT.md`
- [ ] Read `02_PROJECT_WALKTHROUGH.md`
- [ ] Read `03_TECHNICAL_REPLICATION_GUIDE.md`
- [ ] Read `04_HANDOFF_AND_SKILLS.md`
- [ ] Clone repository (`git clone https://github.com/JohnsonJohn-del/arborea-3d-tree-experience.git`)
- [ ] Install exact dependencies (`npm install`)
- [ ] Configure environment (verify Node `>= 18.17`, no `.env` required)
- [ ] Run development server (`npm run dev`)
- [ ] Verify 3D experience at `http://localhost:3000`
- [ ] Verify all interaction states (`SAPLING` → `STEM` → `YOUNG_TREE` → `FULL_TREE` → `BRANCH 01..05` → `FULL_TREE_FINALE`)
- [ ] Verify production build (`npx tsc --noEmit && npm run lint && npm run build`)
- [ ] Review known limitations (Section 8 above)
- [ ] Continue development

---

## 10. GIT HANDOFF & VERIFICATION RECORD

| Field | Verified Value |
| :--- | :--- |
| **Repository** | `https://github.com/JohnsonJohn-del/arborea-3d-tree-experience` |
| **Remote (`origin`)** | `https://github.com/JohnsonJohn-del/arborea-3d-tree-experience.git` |
| **Branch** | `main` |
| **Base Code Commit** | `0017054` (`feat: immersive 3d ancient oak tree growth experience`) |
| **Documentation Commit** | `97bbc72` (`docs: add complete project walkthrough and handoff documentation`) |
| **Committed Handoff Files** | `01_ANTIGRAVITY_EXECUTION_PROMPT.md`, `02_PROJECT_WALKTHROUGH.md`, `03_TECHNICAL_REPLICATION_GUIDE.md`, `04_HANDOFF_AND_SKILLS.md` |
| **Secrets / `.env` Audit** | Verified zero secrets, tokens, or `.env` files tracked in Git |
| **Push Status** | **Pushed and verified on `origin/main`** |
| **Build Verification** | `npx tsc --noEmit` (Pass, 0 errors), `npm run lint` (Pass, 0 warnings/errors), `npm run build` (Pass, exit code 0) |
