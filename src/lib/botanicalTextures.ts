'use client';

import * as THREE from 'three';

export interface BotanicalTextureSet {
  leafColorMap: THREE.CanvasTexture;
  leafNormalMap: THREE.CanvasTexture;
  sprayColorMap: THREE.CanvasTexture;
  sprayNormalMap: THREE.CanvasTexture;
}

/**
 * Draws a realistic lobed Quercus robur (English Oak) leaf with
 * midrib, lateral veins, fine cellular venation, organic color variation,
 * and natural lobed silhouette onto a 2D canvas context.
 */
function drawRealisticOakLeaf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  length: number,
  width: number,
  angle: number,
  hueShift = 0,
  isNormalPass = false
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const drawLeafPath = () => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.025, length * 0.08);

    // Right side: 4 characteristic rounded oak lobes with sinuses
    ctx.bezierCurveTo(
      width * 0.22, length * 0.12,
      width * 0.34, length * 0.20,
      width * 0.18, length * 0.27
    );
    ctx.bezierCurveTo(
      width * 0.44, length * 0.33,
      width * 0.54, length * 0.45,
      width * 0.26, length * 0.53
    );
    ctx.bezierCurveTo(
      width * 0.52, length * 0.60,
      width * 0.50, length * 0.74,
      width * 0.22, length * 0.80
    );
    ctx.bezierCurveTo(
      width * 0.34, length * 0.86,
      width * 0.24, length * 0.96,
      0, length
    );

    // Left side: slightly asymmetric natural oak lobes
    ctx.bezierCurveTo(
      -width * 0.25, length * 0.96,
      -width * 0.35, length * 0.85,
      -width * 0.21, length * 0.79
    );
    ctx.bezierCurveTo(
      -width * 0.51, length * 0.73,
      -width * 0.53, length * 0.59,
      -width * 0.25, length * 0.52
    );
    ctx.bezierCurveTo(
      -width * 0.53, length * 0.44,
      -width * 0.43, length * 0.32,
      -width * 0.17, length * 0.26
    );
    ctx.bezierCurveTo(
      -width * 0.33, length * 0.19,
      -width * 0.21, length * 0.12,
      -width * 0.025, length * 0.08
    );
    ctx.closePath();
  };

  // Petiole stalk
  ctx.strokeStyle = isNormalPass ? 'rgb(128, 145, 255)' : '#738a3d';
  ctx.lineWidth = Math.max(2, width * 0.045);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -length * 0.04);
  ctx.lineTo(0, length * 0.12);
  ctx.stroke();

  drawLeafPath();

  if (isNormalPass) {
    const grad = ctx.createLinearGradient(-width * 0.5, 0, width * 0.5, 0);
    grad.addColorStop(0, 'rgb(102, 128, 245)');
    grad.addColorStop(0.5, 'rgb(128, 134, 255)');
    grad.addColorStop(1, 'rgb(156, 128, 245)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = 'rgb(155, 165, 255)';
    ctx.lineWidth = Math.max(1.5, width * 0.03);
    ctx.beginPath();
    ctx.moveTo(0, length * 0.06);
    ctx.lineTo(0, length * 0.96);
    ctx.stroke();

    const veinPairs = [0.20, 0.39, 0.62, 0.82];
    const veinReaches = [0.24, 0.42, 0.39, 0.20];
    veinPairs.forEach((vy, i) => {
      const reach = veinReaches[i] * width;
      ctx.lineWidth = Math.max(1, width * 0.018);
      ctx.beginPath();
      ctx.moveTo(0, length * vy);
      ctx.quadraticCurveTo(reach * 0.55, length * (vy + 0.03), reach, length * (vy + 0.08));
      ctx.moveTo(0, length * vy);
      ctx.quadraticCurveTo(-reach * 0.55, length * (vy + 0.03), -reach, length * (vy + 0.08));
      ctx.stroke();
    });
  } else {
    // Rich, vibrant natural chlorophyll base so instance colors modulate cleanly without turning black
    const rBase = Math.round(92 + hueShift * 26);
    const gBase = Math.round(148 + hueShift * 32);
    const bBase = Math.round(54 + hueShift * 14);

    const grad = ctx.createRadialGradient(
      0,
      length * 0.48,
      width * 0.05,
      0,
      length * 0.52,
      length * 0.58
    );
    grad.addColorStop(0, `rgb(${rBase + 28}, ${gBase + 36}, ${bBase + 16})`);
    grad.addColorStop(0.65, `rgb(${rBase}, ${gBase}, ${bBase})`);
    grad.addColorStop(1, `rgb(${rBase - 16}, ${gBase - 22}, ${bBase - 12})`);

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = `rgba(${rBase - 24}, ${gBase - 32}, ${bBase - 16}, 0.7)`;
    ctx.lineWidth = Math.max(1, width * 0.014);
    ctx.stroke();

    // Primary Midrib Vein (warm sunlit yellow-green)
    ctx.strokeStyle = `rgba(${Math.min(255, rBase + 68)}, ${Math.min(255, gBase + 68)}, ${bBase + 34}, 0.9)`;
    ctx.lineWidth = Math.max(1.5, width * 0.028);
    ctx.beginPath();
    ctx.moveTo(0, length * 0.06);
    ctx.lineTo(0, length * 0.95);
    ctx.stroke();

    // Secondary Lateral Veins into each oak lobe
    const veinPairs = [0.19, 0.38, 0.61, 0.81];
    const veinReaches = [0.24, 0.42, 0.39, 0.20];
    veinPairs.forEach((vy, i) => {
      const reach = veinReaches[i] * width;
      ctx.lineWidth = Math.max(1, width * 0.015);
      ctx.strokeStyle = `rgba(${Math.min(255, rBase + 54)}, ${Math.min(255, gBase + 58)}, ${bBase + 26}, 0.75)`;
      ctx.beginPath();
      ctx.moveTo(0, length * vy);
      ctx.quadraticCurveTo(reach * 0.55, length * (vy + 0.03), reach, length * (vy + 0.08));
      ctx.moveTo(0, length * vy);
      ctx.quadraticCurveTo(-reach * 0.55, length * (vy + 0.03), -reach, length * (vy + 0.08));
      ctx.stroke();
    });
  }

  ctx.restore();
}

let cachedTextures: BotanicalTextureSet | null = null;

export function getBotanicalTextures(): BotanicalTextureSet {
  if (cachedTextures) return cachedTextures;

  // 1. High-Res Single Lobed Oak Leaf Texture (for Sapling & Close-Up Leaves)
  const leafColorCanvas = document.createElement('canvas');
  leafColorCanvas.width = 512;
  leafColorCanvas.height = 512;
  const lCtx = leafColorCanvas.getContext('2d')!;
  lCtx.clearRect(0, 0, 512, 512);
  drawRealisticOakLeaf(lCtx, 256, 24, 468, 340, 0, 0.15, false);

  const leafNormalCanvas = document.createElement('canvas');
  leafNormalCanvas.width = 512;
  leafNormalCanvas.height = 512;
  const lnCtx = leafNormalCanvas.getContext('2d')!;
  lnCtx.fillStyle = 'rgb(128, 128, 255)';
  lnCtx.fillRect(0, 0, 512, 512);
  drawRealisticOakLeaf(lnCtx, 256, 24, 468, 340, 0, 0, true);

  // 2. High-Density Fine-Scale Botanical Oak Twig & 22-Leaf Spray Atlas
  const sprayColorCanvas = document.createElement('canvas');
  sprayColorCanvas.width = 512;
  sprayColorCanvas.height = 512;
  const sCtx = sprayColorCanvas.getContext('2d')!;
  sCtx.clearRect(0, 0, 512, 512);

  const sprayNormalCanvas = document.createElement('canvas');
  sprayNormalCanvas.width = 512;
  sprayNormalCanvas.height = 512;
  const snCtx = sprayNormalCanvas.getContext('2d')!;
  snCtx.fillStyle = 'rgb(128, 128, 255)';
  snCtx.fillRect(0, 0, 512, 512);

  const drawTwigSkeleton = (ctx: CanvasRenderingContext2D, isNormal: boolean) => {
    ctx.strokeStyle = isNormal ? 'rgb(128, 150, 255)' : '#4a3b2a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(256, 495);
    ctx.quadraticCurveTo(248, 320, 256, 95);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(252, 410);
    ctx.quadraticCurveTo(175, 350, 95, 290);
    ctx.moveTo(254, 385);
    ctx.quadraticCurveTo(335, 325, 415, 265);
    ctx.moveTo(255, 285);
    ctx.quadraticCurveTo(165, 225, 85, 165);
    ctx.moveTo(256, 260);
    ctx.quadraticCurveTo(345, 200, 420, 145);
    ctx.moveTo(256, 175);
    ctx.quadraticCurveTo(195, 125, 145, 85);
    ctx.moveTo(256, 165);
    ctx.quadraticCurveTo(315, 120, 365, 80);
    ctx.stroke();
  };

  drawTwigSkeleton(sCtx, false);
  drawTwigSkeleton(snCtx, true);

  // 22 smaller, realistic-proportion oak leaves per twig spray
  const leafSpecs = [
    { x: 252, y: 425, len: 96, w: 68, ang: -1.15, hue: -0.25 },
    { x: 256, y: 405, len: 98, w: 70, ang: 1.12, hue: -0.15 },
    { x: 185, y: 360, len: 102, w: 72, ang: -0.95, hue: -0.1 },
    { x: 120, y: 310, len: 106, w: 74, ang: -1.25, hue: 0.05 },
    { x: 115, y: 300, len: 100, w: 70, ang: -0.45, hue: 0.15 },
    { x: 325, y: 335, len: 102, w: 72, ang: 0.92, hue: 0.0 },
    { x: 395, y: 280, len: 108, w: 76, ang: 1.22, hue: 0.18 },
    { x: 390, y: 275, len: 98, w: 68, ang: 0.42, hue: 0.25 },
    { x: 254, y: 325, len: 110, w: 78, ang: -0.52, hue: -0.05 },
    { x: 258, y: 310, len: 108, w: 76, ang: 0.55, hue: 0.12 },
    { x: 180, y: 240, len: 108, w: 76, ang: -0.85, hue: 0.08 },
    { x: 105, y: 185, len: 112, w: 78, ang: -1.15, hue: 0.28 },
    { x: 110, y: 175, len: 104, w: 72, ang: -0.35, hue: 0.35 },
    { x: 335, y: 215, len: 108, w: 76, ang: 0.82, hue: 0.1 },
    { x: 400, y: 160, len: 112, w: 78, ang: 1.12, hue: 0.3 },
    { x: 395, y: 155, len: 104, w: 72, ang: 0.32, hue: 0.22 },
    { x: 252, y: 220, len: 114, w: 80, ang: -0.42, hue: 0.15 },
    { x: 260, y: 210, len: 114, w: 80, ang: 0.44, hue: 0.2 },
    { x: 165, y: 105, len: 108, w: 76, ang: -0.68, hue: 0.32 },
    { x: 345, y: 100, len: 108, w: 76, ang: 0.65, hue: 0.28 },
    { x: 238, y: 120, len: 118, w: 82, ang: -0.22, hue: 0.38 },
    { x: 274, y: 120, len: 118, w: 82, ang: 0.24, hue: 0.42 },
  ];

  for (const sp of leafSpecs) {
    sCtx.save();
    sCtx.translate(sp.x, sp.y);
    sCtx.scale(1, -1);
    drawRealisticOakLeaf(sCtx, 0, 0, sp.len, sp.w, sp.ang, sp.hue, false);
    sCtx.restore();

    snCtx.save();
    snCtx.translate(sp.x, sp.y);
    snCtx.scale(1, -1);
    drawRealisticOakLeaf(snCtx, 0, 0, sp.len, sp.w, sp.ang, sp.hue, true);
    snCtx.restore();
  }

  const leafColorMap = new THREE.CanvasTexture(leafColorCanvas);
  leafColorMap.colorSpace = THREE.SRGBColorSpace;
  leafColorMap.anisotropy = 4;
  leafColorMap.needsUpdate = true;

  const leafNormalMap = new THREE.CanvasTexture(leafNormalCanvas);
  leafNormalMap.needsUpdate = true;

  const sprayColorMap = new THREE.CanvasTexture(sprayColorCanvas);
  sprayColorMap.colorSpace = THREE.SRGBColorSpace;
  sprayColorMap.anisotropy = 4;
  sprayColorMap.needsUpdate = true;

  const sprayNormalMap = new THREE.CanvasTexture(sprayNormalCanvas);
  sprayNormalMap.needsUpdate = true;

  cachedTextures = {
    leafColorMap,
    leafNormalMap,
    sprayColorMap,
    sprayNormalMap,
  };

  return cachedTextures;
}
