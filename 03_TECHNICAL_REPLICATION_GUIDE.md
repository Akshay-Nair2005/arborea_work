# 03 — TECHNICAL REPLICATION GUIDE

This document answers the question:
> *"If I give this repository to another developer today, exactly what do they need to install and configure to run, verify, and build the project?"*

Every command, version, file path, and byte size below has been verified against the actual repository.

---

## 1. HARDWARE REQUIREMENTS

> **Note on Benchmarking:** The project was developed and verified on a Windows workstation running Chromium with hardware-accelerated WebGL2. Formal cross-device hardware benchmarking across minimum-spec GPUs has not been performed; therefore, hardware tiers below are explicitly marked as **Estimated / Not formally benchmarked**.

| Tier | CPU | RAM | GPU & VRAM | Storage | Display & Browser GPU Requirements | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Minimum (Client Viewing)** | Dual-core 64-bit x86_64 or ARM64 (e.g., Apple M1 / Intel Core i3 / Snapdragon 8 Gen 1) | 4 GB | Integrated GPU supporting **WebGL 2.0**, `OES_standard_derivatives`, and at least 4096×4096 max texture size (~512 MB shared VRAM) | 100 MB browser cache | 60Hz display; hardware acceleration enabled in browser settings | *Estimated / Not formally benchmarked* |
| **Recommended (Client Viewing)** | Quad-core modern CPU (Apple M1/M2/M3, Intel Core i5 10th Gen+, AMD Ryzen 5 3600+) | 8 GB+ | Dedicated or modern unified GPU (e.g., Apple Silicon, NVIDIA GTX 1060 / RTX series, AMD Radeon RX 580+, Intel Iris Xe) with >= 2 GB VRAM | 250 MB browser cache | 1920×1080 or Retina/HiDPI display (`dpr` up to `2.0`) | *Estimated / Not formally benchmarked* |
| **Development (Local Build & Dev Server)** | 4+ cores / 8+ threads | 8 GB minimum (16 GB recommended for IDE + Next.js dev server + Chrome DevTools) | WebGL 2.0 capable GPU (supports `2048×2048` shadow maps and post-processing `EffectComposer`) | ~650 MB free disk space (`node_modules` ~480 MB + `.next` cache + 8.3 MB assets) | Any desktop display (`>= 1280×800` recommended) | *Verified in development* |
| **Production (Server / Static Host)** | 1 vCPU (during `next build` / `next start`) | 1 GB RAM minimum for `next build` (512 MB for `next start` or static CDN) | **No GPU required on server** (all WebGL rendering runs client-side in the user's browser; `/` is statically prerendered) | ~200 MB on build container | N/A (headless server / Vercel / Cloudflare Pages / Docker) | *Verified via `npm run build`* |

---

## 2. OPERATING SYSTEM

| Operating System | Tested Status | Notes |
| :--- | :--- | :--- |
| **Windows (Windows 10 / 11 x64)** | **Tested & Verified** | Primary development, build (`npm run build`), linting (`npm run lint`), and browser verification environment. |
| **macOS (Intel & Apple Silicon)** | **Not formally tested** (Compatible) | Uses standard cross-platform Node.js, Next.js 14, and WebGL2 APIs with zero OS-specific native binaries. |
| **Linux (Ubuntu / Debian / Alpine)** | **Not formally tested** (Compatible) | Compatible with standard Linux Node.js environments and CI/CD containers (Vercel, GitHub Actions, Docker). Note that Linux filesystems are case-sensitive; all imports in `src/` match exact filename casing. |

---

## 3. REQUIRED SOFTWARE

### Verified System Tooling Versions
These exact versions were used to build, verify, and push the repository:

| Tool | Verified Version in Environment | Minimum Compatible Version | Verification Command |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v24.11.0` | `>= 18.17.0` (Next.js 14 requirement) | `node -v` |
| **npm** | `11.6.1` (`lockfileVersion: 3`) | `>= 9.0.0` | `npm -v` |
| **Git** | `2.51.0.windows.2` | `>= 2.30.0` | `git --version` |
| **Browser** | Chromium / Google Chrome (Desktop `1920×1080` & Mobile emulation `390×844`) | Chrome 90+, Edge 90+, Firefox 90+, Safari 15.4+ with WebGL 2.0 enabled | Open `chrome://gpu` |
| **Optional Tunneling CLI** | `cloudflared` (invoked on-demand via `npx --yes cloudflared tunnel --url http://localhost:3000`) | Optional (only if sharing a temporary public preview URL) | `npx cloudflared --version` |

> **3D / Asset Processing Tooling Note:** No external 3D DCC software (Blender, Maya, Cinema4D) or CLI asset pipeline (`gltf-pipeline`, `toktx`, `basis`) is required to build or run the project. All 3D tree and leaf geometries are generated deterministically in TypeScript (`src/lib/treeGenerator.ts`, `src/components/experience/TreeModel.tsx`), and botanical leaf/spray normal and albedo maps are rendered procedurally via HTML5 `CanvasRenderingContext2D` (`src/lib/botanicalTextures.ts`).

### Exact `package.json` Dependencies

#### Runtime Dependencies (`dependencies`)
| Package | Specified Version (`package.json`) | Purpose |
| :--- | :--- | :--- |
| `next` | `14.2.16` | React App Router framework, static build & dev server |
| `react` | `^18.3.1` | Core React UI library |
| `react-dom` | `^18.3.1` | DOM bindings for React |
| `three` | `^0.169.0` | Core WebGL 3D engine (geometries, materials, shaders, lights, splines) |
| `@react-three/fiber` | `^8.17.10` | React reconciler for Three.js (`<Canvas>`, `useFrame`, `useThree`) |
| `@react-three/drei` | `^9.114.0` | Texture loader (`useTexture`) for PBR bark, soil, and branch photographs |
| `@react-three/postprocessing` | `^2.16.3` | React wrapper for WebGL post-processing (`EffectComposer`, `Bloom`, `Vignette`) |
| `postprocessing` | `^6.36.3` | Underlying post-processing pass library |
| `lucide-react` | `^0.454.0` | UI vector icons (`Volume2`, `VolumeX`, `Sparkles`, `Eye`, `ChevronDown`, `ArrowLeft`, `ArrowRight`, `Compass`, `Maximize2`, `X`, `RotateCcw`) |
| `clsx` | `^2.1.1` | Utility for conditional className strings |
| `framer-motion` | `^11.11.17` | Installed in `package.json` (not actively imported in current components) |
| `gsap` | `^3.12.5` | Installed in `package.json` (not actively imported in current components) |

#### Development Dependencies (`devDependencies`)
| Package | Specified Version (`package.json`) | Purpose |
| :--- | :--- | :--- |
| `typescript` | `^5.6.3` | TypeScript compiler (`npx tsc --noEmit`) |
| `@types/node` | `^20.16.10` | Node.js TypeScript definitions |
| `@types/react` | `^18.3.11` | React TypeScript definitions |
| `@types/react-dom` | `^18.3.1` | React DOM TypeScript definitions |
| `@types/three` | `^0.169.0` | Three.js TypeScript definitions |
| `tailwindcss` | `^3.4.14` | Utility-first CSS framework |
| `postcss` | `^8.4.47` | CSS transformation runner |
| `autoprefixer` | `^10.4.20` | Vendor prefixing for CSS |
| `eslint` | `^8.57.1` | JavaScript/TypeScript linter |
| `eslint-config-next` | `14.2.16` | Next.js ESLint rule configuration |

---

## 4. INSTALLATION

Run the following exact commands in your terminal (PowerShell, CMD, bash, or zsh):

```bash
git clone https://github.com/JohnsonJohn-del/arborea-3d-tree-experience.git
cd arborea-3d-tree-experience
npm install
```

> **Note:** If using a stricter npm configuration that flags peer dependency ranges between React 18 and Three.js ecosystem packages, run:
> ```bash
> npm install --legacy-peer-deps
> ```

---

## 5. ENVIRONMENT VARIABLES

**No environment variables are required** to build, run, or deploy this application. There are no external database connections, private API keys, or third-party authentication tokens.

For completeness, standard optional Next.js runtime environment variables are documented below:

| Variable | Purpose | Required | Example Format | Where Configured | Safe to Expose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *(None required)* | Application runs with zero `.env` configuration | **No** | N/A | N/A | N/A |
| `PORT` | Overrides default port (`3000`) for `npm run dev` or `npm run start` | **No** (Optional) | `PORT=3000` | Shell environment or `.env.local` | Yes |
| `NEXT_TELEMETRY_DISABLED` | Disables anonymous Next.js CLI telemetry during builds | **No** (Optional) | `NEXT_TELEMETRY_DISABLED=1` | Shell environment or CI config | Yes |

---

## 6. LOCAL DEVELOPMENT

### Start Command
```bash
npm run dev
```
*(Or to explicitly bind port 3000: `npm run dev -- -p 3000`)*

### Expected Terminal Output
```text
> immersive-3d-tree-growth@1.0.0 dev
> next dev

  ▲ Next.js 14.2.16
  - Local:        http://localhost:3000
  - Ready in ~2s
```

### Expected URL, Page & WebGL Behavior
1. **Expected URL:** `http://localhost:3000`
2. **Initial Loading State:** Briefly displays the dark obsidian loading screen (`AWAKENING LIVING 3D WORLD...`) while `<TreeScene />` dynamically mounts on the client (`ssr: false`).
3. **Expected Initial WebGL View (`0%` Scroll):**
   - Full-viewport `<canvas>` (`100vw × 100vh`, `position: fixed`).
   - Camera positioned at `[0.0, 0.32, 0.68]` looking at `[0.0, 0.16, 0.0]`.
   - Visiblegerminating oak acorn nut, scaly cupule cap, radicle roots, and a 7-leaf *Quercus robur* seedling rising from displaced forest humus soil (`public/textures/forest-soil.jpg`).
   - Top header shows `ARBOREA · LIVING 3D ARCHIVE`, `LENS · MICROSCOPIC`, stage waypoints `01 Sapling` .. `06 Finale`, `SOUND`, and `CINEMA MOTION`.
   - Left vertical rail shows `SCROLL CHRONICLE 00%` and `BIOMASS MATURITY 0% GROWN`.
   - Bottom editorial caption shows `SAPLING · MICROSCOPIC GENESIS — From Microscopic Stillness`.

---

## 7. PRODUCTION BUILD

### Type Check, Lint & Build Commands
```bash
npx tsc --noEmit
npm run lint
npm run build
```

### Verified Successful Build Output
Running `npm run build` produces the following verified output:
```text
> immersive-3d-tree-growth@1.0.0 build
> next build

  ▲ Next.js 14.2.16

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/5) ...
 ✓ Generating static pages (5/5)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    17.2 kB         105 kB
├ ○ /_not-found                          873 B          88.2 kB
└ ○ /icon.svg                            0 B                0 B
+ First Load JS shared by all            87.3 kB
  ├ chunks/117-739678950e7558c5.js       31.6 kB
  ├ chunks/fd9d1056-5bc63bfeed71c730.js  53.6 kB
  └ other shared chunks (total)          2.09 kB

○  (Static)  prerendered as static content
```

### Production Start Command
```bash
npm run start
```
Starts the production Next.js server on `http://localhost:3000`.

---

## 8. GIT SETUP

- **Repository URL:** `https://github.com/JohnsonJohn-del/arborea-3d-tree-experience`
- **Clone / Remote URL (`origin`):** `https://github.com/JohnsonJohn-del/arborea-3d-tree-experience.git`
- **Default Branch:** `main`
- **Current Active Branch:** `main`
- **CI / Deployment Configuration:** Standard Next.js 14 build (`next build`); zero custom GitHub Actions workflows are required, and the repository can be imported directly into Vercel, Netlify, or Cloudflare Pages out of the box.
- **Important Ignored Files (`.gitignore`):**
  - `/node_modules`
  - `/.pnp` & `.pnp.js`
  - `/coverage`
  - `/.next/` & `/out/`
  - `/build`
  - `.DS_Store` & `*.pem`
  - `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`
  - `.env*.local`
  - `.vercel`
  - `*.tsbuildinfo` & `next-env.d.ts`

---

## 9. ASSETS

### Static File Assets in Repository

| File Path | Format | Exact Size (Bytes) | Purpose | Source / Generation Method | Runtime Usage & Optimization |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public/textures/oak-bark.jpg` | JPEG (`1:1`) | `1,148,941` (~1.15 MB) | Photorealistic seamless macro Ancient Oak bark texture (`map` and `bumpMap` on trunk, boughs, roots, acorn, and sapling stem) | AI-generated via Google Gemini `generate_image` (`oak_bark_texture`) | Loaded via `@react-three/drei` `useTexture`, `RepeatWrapping`, `SRGBColorSpace`, `anisotropy = 8`, `bumpScale = 0.11` |
| `public/textures/forest-soil.jpg` | JPEG (`1:1`) | `1,244,827` (~1.24 MB) | Photorealistic top-down macro forest humus, moss, and decayed twig texture (`map` and `bumpMap` on 42m×42m floor and 3D soil granules) | AI-generated via Google Gemini `generate_image` (`forest_soil_texture`) | Loaded via `useTexture`, `RepeatWrapping` (`28×28` repeat), `SRGBColorSpace`, `anisotropy = 8`, `bumpScale = 0.035` |
| `public/textures/target-oak-reference.jpg` | JPEG (`4:3`) | `1,312,881` (~1.31 MB) | Visual art-direction reference photograph of a centuries-old pasture oak at golden hour | AI-generated via Google Gemini `generate_image` (`target_ancient_oak_reference`) | Reference asset only; **not** downloaded by clients at runtime |
| `public/images/branches/branch-01.jpg` | JPEG (`3:4`) | `685,802` (~686 KB) | Fine-art macro photograph for Branch 01 (*"The Silent Genesis"*) | AI-generated via Google Gemini `generate_image` (`branch_01_genesis`) | Bound to Branch 01 `HangingCard` 3D plane (`useTexture`) & `BranchIndicator` modal (`next/image` with `unoptimized: true`) |
| `public/images/branches/branch-02.jpg` | JPEG (`3:4`) | `992,007` (~992 KB) | Fine-art macro photograph for Branch 02 (*"Rings of Patience"*) | AI-generated via Google Gemini `generate_image` (`branch_02_vascular`) | Bound to Branch 02 `HangingCard` 3D plane & modal |
| `public/images/branches/branch-03.jpg` | JPEG (`3:4`) | `971,735` (~972 KB) | Fine-art photograph for Branch 03 (*"The Unseen Network"*) | AI-generated via Google Gemini `generate_image` (`branch_03_symbiosis`) | Bound to Branch 03 `HangingCard` 3D plane & modal |
| `public/images/branches/branch-04.jpg` | JPEG (`3:4`) | `1,259,017` (~1.26 MB) | Fine-art canopy photograph for Branch 04 (*"Crown of Alchemy"*) | AI-generated via Google Gemini `generate_image` (`branch_04_canopy`) | Bound to Branch 04 `HangingCard` 3D plane & modal |
| `public/images/branches/branch-05.jpg` | JPEG (`3:4`) | `693,032` (~693 KB) | Fine-art macro seed pod photograph for Branch 05 (*"Seeds of Tomorrow"*) | AI-generated via Google Gemini `generate_image` (`branch_05_legacy`) | Bound to Branch 05 `HangingCard` 3D plane & modal |
| `src/app/icon.svg` | SVG | `370` B | Browser favicon (`#060907` rounded square with `#d4af37` ring and `#78c88a` 4-point star) | Hand-authored SVG in `src/app/icon.svg` | Automatically served by Next.js App Router metadata |

### Procedurally Generated In-Memory Assets (Zero Disk/Network Footprint)
1. **Botanical Leaf & Spray Atlases (`src/lib/botanicalTextures.ts`):**
   - `leafColorMap` (`512×512` `CanvasTexture`, `SRGBColorSpace`, `anisotropy = 4`)
   - `leafNormalMap` (`512×512` `CanvasTexture`, tangent-space normal map)
   - `sprayColorMap` (`512×512` `CanvasTexture`, 22-leaf oak twig spray, `SRGBColorSpace`, `anisotropy = 4`)
   - `sprayNormalMap` (`512×512` `CanvasTexture`, 22-leaf oak twig spray normal map)
2. **Archival Card Letterpress Plaques (`src/components/experience/HangingCard.tsx`):**
   - `createArchivalLabelTexture(branch, hovered)` (`768×420` `CanvasTexture` per card, rendering museum cotton-rag grain, category/year headers, serif title, wrapped description, CTA button, and GPS/elevation stamp).
3. **Atmospheric Textures (`Environment.tsx` & `ParticleSystem.tsx`):**
   - `createGodRayGradientTexture()` (`128×256` `CanvasTexture` for additive sunbeam shafts).
   - `createSoftParticleTexture()` (`64×64` radial gradient `CanvasTexture` for spores and pollen).

---

## 10. TROUBLESHOOTING

### 1. WebGL Context Unavailable / Blank Obsidian Screen
- **Cause:** Browser hardware acceleration is disabled, or the environment is running in a headless/remote desktop session without a WebGL2 driver.
- **Solution:** Enable `"Use graphics acceleration when available"` in browser settings (`chrome://settings/system`) and verify WebGL2 status at `chrome://gpu`.

### 2. Shader Compilation Failure on `barkMaterial` / `barkDepthMaterial`
- **Cause:** Modifying `src/shaders/treeShaders.ts` or `src/lib/treeGenerator.ts` such that vertex attributes (`aSpinePos`, `aBirth`, `aMature`, `aPrune`, `aLevel`) are missing from `barkGeometry`, or breaking `#include <common>` / `#include <begin_vertex>` / `#include <clipping_planes_fragment>` replacement hooks in Three.js `r169`.
- **Solution:** Ensure `treeGenerator.ts` attaches all 5 custom `Float32BufferAttribute` buffers (`aSpinePos`, `aBirth`, `aMature`, `aPrune`, `aLevel`) and that `applyBarkGrowthShader` is attached via `mat.onBeforeCompile` on both `MeshStandardMaterial` and `MeshDepthMaterial`.

### 3. Missing Texture Asset (`404 Not Found` on `/textures/*` or `/images/branches/*`)
- **Cause:** Moving or renaming files inside `public/textures/` or `public/images/branches/` causes `@react-three/drei`'s `useTexture` suspense loader to reject, preventing `<Suspense>` in `TreeScene.tsx` from resolving `<TreeGrowth />` and `<BranchExplorer />`.
- **Solution:** Verify all 7 runtime JPEGs exist at their exact paths:
  - `public/textures/oak-bark.jpg`
  - `public/textures/forest-soil.jpg`
  - `public/images/branches/branch-01.jpg` through `branch-05.jpg`

### 4. Next.js SSR / Build Failure (`window is not defined` or `document is not defined`)
- **Cause:** Importing `TreeScene.tsx` or `botanicalTextures.ts` statically on the server without `next/dynamic` (`{ ssr: false }`).
- **Solution:** Keep the dynamic import in `src/app/page.tsx` (`const TreeScene = dynamic(() => import('@/components/experience/TreeScene').then((mod) => mod.TreeScene), { ssr: false })`).

### 5. Dependency Mismatch during `npm install`
- **Cause:** Strict npm peer-dependency checks between React 18 type packages and `@react-three/*`.
- **Solution:** Run `npm install --legacy-peer-deps`.

### 6. Low FPS on High-Resolution Displays or Integrated GPUs
- **Cause:** Rendering a 4K/5K monitor at `dpr = 2` with `2048×2048` shadow maps and `Bloom` post-processing.
- **Solution:** Click the **`CINEMA MOTION` → `CALM MOTION`** toggle in the top-right navigation bar (which reduces wind/particle calculations), or lower the desktop `dpr` cap in `src/components/experience/TreeScene.tsx` from `[1, 2]` to `[1, 1.5]`.

### 7. Mobile Rendering / Aspect Ratio Framing Issue
- **Cause:** Testing mobile layout by only shrinking browser height or without triggering `window.innerWidth < 768`.
- **Solution:** `TreeScene.tsx` listens to `window.resize` and sets `isMobile = window.innerWidth < 768`. When `< 768px`, `CameraController.tsx` automatically multiplies the growth spline Z distance by `1.28` (`mobileZScale`) and offsets branch card Z by `+0.65m` so the wide oak canopy and 3D cards fit portrait screens cleanly.

---

## 11. EXACT REPLICATION CHECKLIST

Use this checklist to verify a fresh clone from start to finish:

- [ ] Repository cloned (`git clone https://github.com/JohnsonJohn-del/arborea-3d-tree-experience.git`)
- [ ] Correct branch checked out (`main`)
- [ ] Correct Node.js version installed (`>= 18.17.0`, verified on `v24.11.0`)
- [ ] Correct package manager installed (`npm`, verified on `11.6.1`)
- [ ] Dependencies installed (`npm install` completes with `0` errors)
- [ ] Environment variables verified (none required)
- [ ] All 8 image/texture assets present in `public/textures/` and `public/images/branches/`
- [ ] Development server starts (`npm run dev` on `http://localhost:3000`)
- [ ] WebGL 2.0 canvas initializes with zero console errors
- [ ] Tree loads deterministically (`seed = 7919`) with PBR bark and soil textures
- [ ] Stage 01 (`0%–18%`) Sapling works (acorn nut, cupule cap, radicle roots, 7 veined oak leaves)
- [ ] Stage 02 (`18%–36%`) Developing Stem works (sapling absorbed into woody stem, 9 juvenile lateral shoots unfurl)
- [ ] Stage 03 (`36%–54%`) Young Tree works (juvenile shoots self-prune between `0.46` and `0.60`, 3 co-dominant trunks fork, surface roots emerge)
- [ ] Stage 04 (`54%–71%`) Full Tree works (2.12m fluted base, full asymmetric oak crown, 5 hanging cards unfurl)
- [ ] Stage 05 (`71%–94.8%`) Branch Exploration works across all 5 branches (`01` through `05`)
- [ ] Physical 3D Hanging Cards work (pendulum sway, hover highlight, click opens Specimen Modal)
- [ ] Keyboard navigation works (`ArrowRight` / `ArrowLeft` cycle branches, `Escape` closes modal)
- [ ] Web Audio toggle works (`SOUND` button synthesizes pink-noise wind and harmonic chimes)
- [ ] Reduced Motion toggle works (`CALM MOTION` dampens parallax, wind, and particles)
- [ ] Reverse scroll works (scrolling from `100%` back to `0%` cleanly reverses growth back to the acorn)
- [ ] Mobile viewport (`< 768px`, e.g. `390×844`) works with adjusted FOV (`50°`), `1.28×` Z-scale, and reduced instance counts
- [ ] TypeScript validation passes (`npx tsc --noEmit`)
- [ ] ESLint validation passes (`npm run lint`)
- [ ] Production build succeeds (`npm run build` and `npm run start`)
