import * as THREE from 'three';

/**
 * Aplikuje efekt opotřebení/stáří na canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Šířka canvasu
 * @param {number} height - Výška canvasu
 * @param {number} wear - Úroveň opotřebení (0 = nová, 1 = hodně stará)
 */
const applyWearEffect = (ctx, width, height, wear) => {
  if (wear <= 0) return;
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Seeded random pro konzistentní wear pattern
  let seed = 12345;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  // Počet "oloupaných" míst závisí na wear
  const scratchCount = Math.floor(wear * 200);
  
  for (let i = 0; i < scratchCount; i++) {
    const x = Math.floor(random() * width);
    const y = Math.floor(random() * height);
    const size = Math.floor(random() * 15 * wear + 2);
    
    // Vytvořit oloupané místo (průhlednost)
    for (let dy = -size; dy <= size; dy++) {
      for (let dx = -size; dx <= size; dx++) {
        const px = x + dx;
        const py = y + dy;
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= size) {
            const idx = (py * width + px) * 4;
            // Snížit alpha (průhlednost = oloupání)
            const fade = 1 - (dist / size);
            data[idx + 3] *= (1 - fade * wear * random());
          }
        }
      }
    }
  }
  
  // Obecné vyblednutí podle wear
  for (let i = 0; i < data.length; i += 4) {
    // Snížit alpha celkově
    data[i + 3] *= (1 - wear * 0.3);
    
    // Přidat šum
    if (random() < wear * 0.1) {
      data[i + 3] *= 0.5;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Vytvoří texturu vhazovacího kruhu s pozicí, scalem a rotací
 */
export const createFaceoffCircle = (color = '#ff0000', options = {}) => {
  const { posX = 0.5, posY = 0.5, scale = 1, rotation = 0, wear = 0 } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  // Vyplnit celý canvas bílou s alpha=0 (průhledná bílá místo průhledné černé)
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, 512, 512);
  
  const centerX = posX * 512;
  const centerY = posY * 512;
  const outerRadius = 200 * scale;
  const innerRadius = 180 * scale;
  
  // Uložit context a aplikovat rotaci
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.translate(-centerX, -centerY);
  
  // Vnější kruh
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 20 * scale;
  ctx.stroke();
  
  // Vnitřní tečky (4 body)
  const dotRadius = 15 * scale;
  const dotDistance = 100 * scale;
  [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(centerX + dx * dotDistance, centerY + dy * dotDistance, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
  
  // Středová tečka
  ctx.beginPath();
  ctx.arc(centerX, centerY, 20 * scale, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  
  ctx.restore();

  // Aplikovat efekt opotřebení
  applyWearEffect(ctx, 512, 512, wear);
  
  // Aplikovat efekt opotřebení
  applyWearEffect(ctx, 512, 512, wear);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
};

/**
 * Vytvoří texturu modré čáry s pozicí, scalem a rotací
 */
export const createBlueLine = (options = {}) => {
  const { posX = 0.5, posY = 0.5, scale = 1, rotation = 0, wear = 0 } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, 512, 512);
  
  const centerX = posX * 512;
  const centerY = posY * 512;
  const lineHeight = 52 * scale;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * Math.PI / 180);
  
  ctx.fillStyle = '#0033cc';
  ctx.fillRect(-256, -lineHeight/2, 512, lineHeight);
  
  ctx.restore();

  // Aplikovat efekt opotřebení
  applyWearEffect(ctx, 512, 512, wear);
  
  // Aplikovat efekt opotřebení
  applyWearEffect(ctx, 512, 512, wear);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
};

/**
 * Vytvoří texturu červené čáry s pozicí, scalem a rotací
 */
export const createRedLine = (options = {}) => {
  const { posX = 0.5, posY = 0.5, scale = 1, rotation = 0, wear = 0 } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, 512, 512);
  
  const centerX = posX * 512;
  const centerY = posY * 512;
  const lineHeight = 52 * scale;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * Math.PI / 180);
  
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(-256, -lineHeight/2, 512, lineHeight);
  
  ctx.restore();

  // Aplikovat efekt opotřebení
  applyWearEffect(ctx, 512, 512, wear);
  
  // Aplikovat efekt opotřebení
  applyWearEffect(ctx, 512, 512, wear);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
};

/**
 * Vytvoří texturu brankové čáry s pozicí, scalem a rotací
 */
export const createGoalLine = (options = {}) => {
  const { posX = 0.5, posY = 0.5, scale = 1, rotation = 0, wear = 0 } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, 512, 512);
  
  const centerX = posX * 512;
  const centerY = posY * 512;
  const lineHeight = 40 * scale;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * Math.PI / 180);
  
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(-256, -lineHeight/2, 512, lineHeight);
  
  ctx.restore();

  // Aplikovat efekt opotřebení
  applyWearEffect(ctx, 512, 512, wear);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
};

/**
 * Vytvoří texturu brankoviště s pozicí, scalem a rotací
 */
export const createCrease = (options = {}) => {
  const { posX = 0.5, posY = 0.5, scale = 1, rotation = 0, wear = 0 } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, 512, 512);
  
  const centerX = posX * 512;
  const centerY = posY * 512;
  const radius = 120 * scale;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.translate(-centerX, -centerY);
  
  // Modrý půlkruh (brankoviště)
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 15 * scale;
  ctx.stroke();
  
  // Vyplnění
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
  ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
  ctx.fill();
  
  ctx.restore();

  // Aplikovat efekt opotřebení
  applyWearEffect(ctx, 512, 512, wear);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
};

/**
 * Vytvoří texturu s tečkami pro vhazování s pozicí, scalem a rotací
 */
export const createFaceoffDots = (color = '{}', options = {}) => {
  const { posX = 0.5, posY = 0.5, scale = 1, rotation = 0, wear = 0 } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, 512, 512);
  
  const centerX = posX * 512;
  const centerY = posY * 512;
  const dotRadius = 25 * scale;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.translate(-centerX, -centerY);
  
  // Dvě tečky vedle sebe
  ctx.beginPath();
  ctx.arc(centerX - 60 * scale, centerY, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(centerX + 60 * scale, centerY, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  
  ctx.restore();

  // Aplikovat efekt opotřebení
  applyWearEffect(ctx, 512, 512, wear);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
};

/**
 * Vytvoří texturu středového vhazovacího bodu s pozicí, scalem a rotací
 */
export const createCenterDot = (color = '{}', options = {}) => {
  const { posX = 0.5, posY = 0.5, scale = 1, rotation = 0, wear = 0 } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, 512, 512);
  
  const centerX = posX * 512;
  const centerY = posY * 512;
  
  // Velká středová tečka
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30 * scale, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
};

/**
 * Vytvoří texturu kompletního hokejového kluziště
 */
export const createFullRink = (options = {}) => {
  const { posX = 0.5, posY = 0.5, scale = 1, rotation = 0, wear = 0 } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, 1024, 512);
  
  const centerX = posX * 1024;
  const centerY = posY * 512;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.translate(-centerX, -centerY);
  
  // Červená středová čára
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(510 * scale, 0, 4 * scale, 512);
  
  // Modré čáry
  ctx.fillStyle = '#0033cc';
  ctx.fillRect(340 * scale, 0, 4 * scale, 512);
  ctx.fillRect(680 * scale, 0, 4 * scale, 512);
  
  // Brankové čáry
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(100 * scale, 0, 3 * scale, 512);
  ctx.fillRect(920 * scale, 0, 3 * scale, 512);
  
  ctx.restore();

  // Aplikovat efekt opotřebení
  applyWearEffect(ctx, 512, 512, wear);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
};
