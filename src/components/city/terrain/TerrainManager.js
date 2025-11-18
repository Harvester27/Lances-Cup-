import * as THREE from 'three';

const DEFAULT_TILE_SIZE = 200;
const DEFAULT_RESOLUTION = 129;
const DEFAULT_VIEW_DISTANCE = 3; // Zvýšeno z 1 na 3 pro lepší dohled
const MAX_HEIGHT = 20;

// Typy povrchů terénu
const TERRAIN_SURFACE_TYPES = {
  GRASS: 0,
  ROCK: 1,
  SAND: 2,
  SNOW: 3,
  CONCRETE: 4,
  ICE: 5,
};

// Vytvoření textury pro trávu
const createGrassTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Seedovaný random generátor pro konzistentní texturu
  class SeededRandom {
    constructor(seed = 12345) {
      this.seed = seed;
    }
    next() {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    }
  }
  
  const rng = new SeededRandom(42);
  
  // Základní zelená barva
  ctx.fillStyle = '#3b6b3b';
  ctx.fillRect(0, 0, 512, 512);
  
  // Přidání různých odstínů zelené
  const grassColors = ['#4a7c4a', '#2d5a2d', '#3b6b3b', '#5a8a5a', '#2d4a2d'];
  for (let i = 0; i < 3000; i++) {
    const x = rng.next() * 512;
    const y = rng.next() * 512;
    const color = grassColors[Math.floor(rng.next() * grassColors.length)];
    const size = 1 + rng.next() * 3;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }
  
  // Přidání šumu pro realističtější vzhled
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng.next() - 0.5) * 15;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
};

// Vytvoření textury pro skalnatý povrch
const createRockTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  class SeededRandom {
    constructor(seed = 54321) {
      this.seed = seed;
    }
    next() {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    }
  }
  
  const rng = new SeededRandom(99);
  
  // Základní šedá barva
  ctx.fillStyle = '#5a5a5a';
  ctx.fillRect(0, 0, 512, 512);
  
  // Přidání různých odstínů šedé a hnědé pro skalnatý vzhled
  const rockColors = ['#6a6a6a', '#4a4a4a', '#5a5a5a', '#7a7a7a', '#3d3d3d', '#6b5a4a'];
  for (let i = 0; i < 4000; i++) {
    const x = rng.next() * 512;
    const y = rng.next() * 512;
    const color = rockColors[Math.floor(rng.next() * rockColors.length)];
    const size = 2 + rng.next() * 5;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }
  
  // Přidání větších "kamenů"
  for (let i = 0; i < 200; i++) {
    const x = rng.next() * 512;
    const y = rng.next() * 512;
    const size = 10 + rng.next() * 20;
    const color = rockColors[Math.floor(rng.next() * rockColors.length)];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Přidání šumu
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng.next() - 0.5) * 20;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
};

// Vytvoření textury pro písek
const createSandTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  class SeededRandom {
    constructor(seed = 11111) {
      this.seed = seed;
    }
    next() {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    }
  }
  
  const rng = new SeededRandom(77);
  
  // Základní písková barva
  ctx.fillStyle = '#d4c5a9';
  ctx.fillRect(0, 0, 512, 512);
  
  // Přidání různých odstínů písku
  const sandColors = ['#e5d4b8', '#c4b59a', '#d4c5a9', '#f0e6d2', '#b8a88a'];
  for (let i = 0; i < 3500; i++) {
    const x = rng.next() * 512;
    const y = rng.next() * 512;
    const color = sandColors[Math.floor(rng.next() * sandColors.length)];
    const size = 1 + rng.next() * 4;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }
  
  // Přidání šumu
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng.next() - 0.5) * 18;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
};

// Vytvoření textury pro sníh
const createSnowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  class SeededRandom {
    constructor(seed = 22222) {
      this.seed = seed;
    }
    next() {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    }
  }
  
  const rng = new SeededRandom(88);
  
  // Základní bílá barva
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 512, 512);
  
  // Přidání různých odstínů bílé a modré
  const snowColors = ['#ffffff', '#f5f5f5', '#e8e8e8', '#fafafa', '#e0e8f0'];
  for (let i = 0; i < 4000; i++) {
    const x = rng.next() * 512;
    const y = rng.next() * 512;
    const color = snowColors[Math.floor(rng.next() * snowColors.length)];
    const size = 1 + rng.next() * 5;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }
  
  // Přidání šumu
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng.next() - 0.5) * 12;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
};

// Vytvoření textury pro beton
const createConcreteTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  class SeededRandom {
    constructor(seed = 33333) {
      this.seed = seed;
    }
    next() {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    }
  }
  
  const rng = new SeededRandom(55);
  
  // Základní šedá betonová barva
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(0, 0, 512, 512);
  
  // Přidání různých odstínů šedé
  const concreteColors = ['#9a9a9a', '#7a7a7a', '#8a8a8a', '#a0a0a0', '#6a6a6a'];
  for (let i = 0; i < 3000; i++) {
    const x = rng.next() * 512;
    const y = rng.next() * 512;
    const color = concreteColors[Math.floor(rng.next() * concreteColors.length)];
    const size = 2 + rng.next() * 6;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }
  
  // Přidání větších "betonových bloků"
  for (let i = 0; i < 50; i++) {
    const x = rng.next() * 512;
    const y = rng.next() * 512;
    const size = 20 + rng.next() * 40;
    const color = concreteColors[Math.floor(rng.next() * concreteColors.length)];
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }
  
  // Přidání šumu
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng.next() - 0.5) * 15;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
};

// Vytvoření textury pro led
const createIceTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  class SeededRandom {
    constructor(seed = 44444) {
      this.seed = seed;
    }
    next() {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    }
  }
  
  const rng = new SeededRandom(66);
  
  // Základní světle modrá barva ledu
  ctx.fillStyle = '#b8d4e8';
  ctx.fillRect(0, 0, 512, 512);
  
  // Přidání různých odstínů modré a bílé
  const iceColors = ['#c8e4f8', '#a8c4d8', '#b8d4e8', '#d8e8f8', '#98b4c8'];
  for (let i = 0; i < 2500; i++) {
    const x = rng.next() * 512;
    const y = rng.next() * 512;
    const color = iceColors[Math.floor(rng.next() * iceColors.length)];
    const size = 1 + rng.next() * 4;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }
  
  // Přidání "ledových krystalů"
  for (let i = 0; i < 100; i++) {
    const x = rng.next() * 512;
    const y = rng.next() * 512;
    const size = 5 + rng.next() * 15;
    const color = iceColors[Math.floor(rng.next() * iceColors.length)];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Přidání šumu
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng.next() - 0.5) * 10;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
};

class TerrainChunk {
  constructor(manager, tileX, tileZ) {
    this.manager = manager;
    this.tileX = tileX;
    this.tileZ = tileZ;
    this.tileSize = manager.tileSize;
    this.resolution = manager.resolution;
    this.key = `${tileX}:${tileZ}`;
    this.scene = manager.scene;
    this.heightmap = new Float32Array(this.resolution * this.resolution);
    this.surfacemap = new Uint8Array(this.resolution * this.resolution); // 0 = tráva, 1 = skalnatý
    this.dirty = false;

    this.geometry = new THREE.PlaneGeometry(
      this.tileSize,
      this.tileSize,
      this.resolution - 1,
      this.resolution - 1
    );
    this.geometry.rotateX(-Math.PI / 2);

    // Vytvořit textury pro různé povrchy (sdílené mezi všemi chunky)
    this.grassTexture = manager.grassTexture || createGrassTexture();
    this.rockTexture = manager.rockTexture || createRockTexture();
    this.sandTexture = manager.sandTexture || createSandTexture();
    this.snowTexture = manager.snowTexture || createSnowTexture();
    this.concreteTexture = manager.concreteTexture || createConcreteTexture();
    this.iceTexture = manager.iceTexture || createIceTexture();
    if (!manager.grassTexture) manager.grassTexture = this.grassTexture;
    if (!manager.rockTexture) manager.rockTexture = this.rockTexture;
    if (!manager.sandTexture) manager.sandTexture = this.sandTexture;
    if (!manager.snowTexture) manager.snowTexture = this.snowTexture;
    if (!manager.concreteTexture) manager.concreteTexture = this.concreteTexture;
    if (!manager.iceTexture) manager.iceTexture = this.iceTexture;
    
    // Vytvořit ShaderMaterial pro mixování textur podle surface map
    this.material = this.createSurfaceMaterial();
    
    // Přidat vertex colors pro mixování povrchů (bude aktualizováno podle surface map)
    this.updateSurfaceColors();

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
    this.mesh.name = `TerrainChunk_${this.key}`;
    this.mesh.userData.type = 'terrainChunk';
    this.mesh.position.set(this.tileX * this.tileSize, 0, this.tileZ * this.tileSize);

    this.loadFromStorage();
    this.updateGeometryVertices();

    if (this.scene) {
      this.scene.add(this.mesh);
    }
  }

  createSurfaceMaterial() {
    // Použijeme ShaderMaterial pro výběr textury podle surface type
    const vertexShader = `
      varying vec2 vUv;
      varying float vSurfaceType;
      void main() {
        vUv = uv;
        // R kanál obsahuje surface type (0-5)
        vSurfaceType = color.r;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const fragmentShader = `
      uniform sampler2D grassTexture;
      uniform sampler2D rockTexture;
      uniform sampler2D sandTexture;
      uniform sampler2D snowTexture;
      uniform sampler2D concreteTexture;
      uniform sampler2D iceTexture;
      varying vec2 vUv;
      varying float vSurfaceType;
      void main() {
        vec4 finalColor;
        // Výběr textury podle surface type
        if (vSurfaceType < 0.5) {
          // 0 = tráva
          finalColor = texture2D(grassTexture, vUv);
        } else if (vSurfaceType < 1.5) {
          // 1 = skalnatý
          finalColor = texture2D(rockTexture, vUv);
        } else if (vSurfaceType < 2.5) {
          // 2 = písek
          finalColor = texture2D(sandTexture, vUv);
        } else if (vSurfaceType < 3.5) {
          // 3 = sníh
          finalColor = texture2D(snowTexture, vUv);
        } else if (vSurfaceType < 4.5) {
          // 4 = beton
          finalColor = texture2D(concreteTexture, vUv);
        } else {
          // 5 = led
          finalColor = texture2D(iceTexture, vUv);
        }
        gl_FragColor = finalColor;
      }
    `;
    
    return new THREE.ShaderMaterial({
      uniforms: {
        grassTexture: { value: this.grassTexture },
        rockTexture: { value: this.rockTexture },
        sandTexture: { value: this.sandTexture },
        snowTexture: { value: this.snowTexture },
        concreteTexture: { value: this.concreteTexture },
        iceTexture: { value: this.iceTexture },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      vertexColors: true,
    });
  }

  updateSurfaceColors() {
    if (!this.geometry) return;
    let colorAttr = this.geometry.attributes.color;
    if (!colorAttr) {
      const colorArray = new Float32Array(this.resolution * this.resolution * 3);
      colorAttr = new THREE.BufferAttribute(colorArray, 3);
      this.geometry.setAttribute('color', colorAttr);
    }
    for (let i = 0; i < this.surfacemap.length; i++) {
      const surfaceType = this.surfacemap[i];
      // R kanál obsahuje surface type (0-5)
      colorAttr.setXYZ(i, surfaceType, 1, 1);
    }
    colorAttr.needsUpdate = true;
  }

  get storageKey() {
    const base = this.manager?.getStorageKey?.();
    if (!base) return null;
    return `${base}:terrain:${this.tileX}:${this.tileZ}`;
  }
  
  get surfaceStorageKey() {
    const base = this.manager?.getStorageKey?.();
    if (!base) return null;
    return `${base}:terrain:surface:${this.tileX}:${this.tileZ}`;
  }

  loadFromStorage() {
    const key = this.storageKey;
    if (!key) {
      this.heightmap.fill(0);
      this.surfacemap.fill(TERRAIN_SURFACE_TYPES.GRASS);
      return;
    }
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        this.heightmap.fill(0);
        this.surfacemap.fill(TERRAIN_SURFACE_TYPES.GRASS);
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === this.heightmap.length) {
        this.heightmap = Float32Array.from(parsed);
      } else {
        this.heightmap.fill(0);
      }
    } catch (error) {
      console.error('Chyba při načítání chunku terénu:', error);
      this.heightmap.fill(0);
    }
    
    // Načíst surface map
    const surfaceKey = this.surfaceStorageKey;
    if (surfaceKey) {
      try {
        const surfaceRaw = localStorage.getItem(surfaceKey);
        if (surfaceRaw) {
          const surfaceParsed = JSON.parse(surfaceRaw);
          if (Array.isArray(surfaceParsed) && surfaceParsed.length === this.surfacemap.length) {
            this.surfacemap = Uint8Array.from(surfaceParsed);
          } else {
            this.surfacemap.fill(TERRAIN_SURFACE_TYPES.GRASS);
          }
        } else {
          this.surfacemap.fill(TERRAIN_SURFACE_TYPES.GRASS);
        }
      } catch (error) {
        console.error('Chyba při načítání surface map:', error);
        this.surfacemap.fill(TERRAIN_SURFACE_TYPES.GRASS);
      }
    } else {
      this.surfacemap.fill(TERRAIN_SURFACE_TYPES.GRASS);
    }
    
    this.updateSurfaceColors();
  }

  saveToStorage() {
    const key = this.storageKey;
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(this.heightmap)));
      this.dirty = false;
    } catch (error) {
      console.error('Chyba při ukládání chunku terénu:', error);
    }
    
    // Uložit surface map
    const surfaceKey = this.surfaceStorageKey;
    if (surfaceKey) {
      try {
        localStorage.setItem(surfaceKey, JSON.stringify(Array.from(this.surfacemap)));
      } catch (error) {
        console.error('Chyba při ukládání surface map:', error);
      }
    }
  }

  applySurfaceBrush(worldPoint, { surfaceType = TERRAIN_SURFACE_TYPES.GRASS, radius = 5, strength = 1.0 } = {}) {
    const gridCenter = this.worldToGrid(worldPoint);
    if (!gridCenter) return false;
    const radiusInGrid = (radius / this.tileSize) * (this.resolution - 1);
    if (radiusInGrid <= 0) return false;
    const radiusSq = radiusInGrid * radiusInGrid;

    const minX = Math.max(0, Math.floor(gridCenter.x - radiusInGrid));
    const maxX = Math.min(this.resolution - 1, Math.ceil(gridCenter.x + radiusInGrid));
    const minZ = Math.max(0, Math.floor(gridCenter.z - radiusInGrid));
    const maxZ = Math.min(this.resolution - 1, Math.ceil(gridCenter.z + radiusInGrid));

    let changed = false;

    for (let z = minZ; z <= maxZ; z++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - gridCenter.x;
        const dz = z - gridCenter.z;
        const distSq = dx * dx + dz * dz;
        if (distSq > radiusSq) continue;

        const influence = 1 - Math.sqrt(distSq) / radiusInGrid;
        const index = this.indexFromGrid(x, z);
        const currentSurface = this.surfacemap[index];
        
        // Interpolace mezi současným a novým povrchem podle strength
        const newSurface = Math.round(THREE.MathUtils.lerp(currentSurface, surfaceType, strength * influence));
        
        if (newSurface !== currentSurface) {
          this.surfacemap[index] = newSurface;
          changed = true;
        }
      }
    }

    if (changed) {
      this.updateSurfaceColors();
      this.dirty = true;
      this.manager.dirtyChunks.add(this);
    }

    return changed;
  }

  dispose() {
    if (this.scene && this.mesh) {
      this.scene.remove(this.mesh);
    }
    if (this.geometry) {
      this.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
    // Textury jsou sdílené, nebudeme je disposeovat zde
    this.mesh = null;
    this.geometry = null;
    this.material = null;
  }

  updateGeometryVertices() {
    if (!this.geometry) return;
    const position = this.geometry.attributes.position;
    for (let i = 0; i < this.heightmap.length; i++) {
      position.setY(i, this.heightmap[i]);
    }
    position.needsUpdate = true;
    this.geometry.computeVertexNormals();
    if (this.geometry.attributes.normal) {
      this.geometry.attributes.normal.needsUpdate = true;
    }
  }

  worldToGrid(point) {
    const half = this.tileSize / 2;
    const localX = point.x - this.tileX * this.tileSize;
    const localZ = point.z - this.tileZ * this.tileSize;
    if (localX < -half || localX > half || localZ < -half || localZ > half) {
      return null;
    }
    const normalizedX = (localX + half) / this.tileSize;
    const normalizedZ = (localZ + half) / this.tileSize;

    return {
      x: normalizedX * (this.resolution - 1),
      z: normalizedZ * (this.resolution - 1),
    };
  }

  indexFromGrid(x, z) {
    return z * this.resolution + x;
  }

  getNeighborAverage(x, z) {
    let total = 0;
    let count = 0;
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const nz = z + dz;
        if (nx < 0 || nx >= this.resolution || nz < 0 || nz >= this.resolution) continue;
        total += this.heightmap[this.indexFromGrid(nx, nz)];
        count++;
      }
    }
    return count > 0 ? total / count : this.heightmap[this.indexFromGrid(x, z)];
  }

  applyBrush(worldPoint, { mode = 'raise', radius = 5, strength = 0.5 } = {}) {
    const gridCenter = this.worldToGrid(worldPoint);
    if (!gridCenter) return false;
    const radiusInGrid = (radius / this.tileSize) * (this.resolution - 1);
    if (radiusInGrid <= 0) return false;
    const radiusSq = radiusInGrid * radiusInGrid;

    const minX = Math.max(0, Math.floor(gridCenter.x - radiusInGrid));
    const maxX = Math.min(this.resolution - 1, Math.ceil(gridCenter.x + radiusInGrid));
    const minZ = Math.max(0, Math.floor(gridCenter.z - radiusInGrid));
    const maxZ = Math.min(this.resolution - 1, Math.ceil(gridCenter.z + radiusInGrid));
    const touchesLeft = gridCenter.x - radiusInGrid < 0;
    const touchesRight = gridCenter.x + radiusInGrid > this.resolution - 1;
    const touchesTop = gridCenter.z - radiusInGrid < 0;
    const touchesBottom = gridCenter.z + radiusInGrid > this.resolution - 1;

    let changed = false;

    for (let z = minZ; z <= maxZ; z++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - gridCenter.x;
        const dz = z - gridCenter.z;
        const distSq = dx * dx + dz * dz;
        if (distSq > radiusSq) continue;

        const influence = 1 - Math.sqrt(distSq) / radiusInGrid;
        const index = this.indexFromGrid(x, z);
        let newValue = this.heightmap[index];

        if (mode === 'raise') {
          newValue = Math.min(MAX_HEIGHT, newValue + strength * influence);
        } else if (mode === 'lower') {
          newValue = Math.max(-MAX_HEIGHT, newValue - strength * influence);
        } else if (mode === 'smooth') {
          const average = this.getNeighborAverage(x, z);
          newValue = THREE.MathUtils.lerp(newValue, average, 0.5 * influence);
        }

        if (newValue !== this.heightmap[index]) {
          this.heightmap[index] = newValue;
          changed = true;
        }
      }
    }

    if (changed) {
      this.updateGeometryVertices();
      this.dirty = true;
      this.manager.syncChunkBorders(this, {
        minX,
        maxX,
        minZ,
        maxZ,
        touchesLeft,
        touchesRight,
        touchesTop,
        touchesBottom,
      });
    }
    return changed;
  }

  applySlopeBand({ center, direction, right, halfLength, halfWidth, baseHeight, deltaHeight }) {
    if (!center || !direction || !right) return false;
    if (halfLength <= 0 || halfWidth <= 0 || Math.abs(deltaHeight) < 1e-4) return false;

    const step = this.tileSize / (this.resolution - 1);
    const startX = this.mesh.position.x - this.tileSize / 2;
    const startZ = this.mesh.position.z - this.tileSize / 2;

    let changed = false;
    let minTouchedX = this.resolution;
    let maxTouchedX = -1;
    let minTouchedZ = this.resolution;
    let maxTouchedZ = -1;

    for (let zIndex = 0; zIndex < this.resolution; zIndex++) {
      const worldZ = startZ + zIndex * step;
      for (let xIndex = 0; xIndex < this.resolution; xIndex++) {
        const worldX = startX + xIndex * step;
        const offsetX = worldX - center.x;
        const offsetZ = worldZ - center.z;

        const along = offsetX * direction.x + offsetZ * direction.y;
        if (Math.abs(along) > halfLength) continue;

        const lateral = offsetX * right.x + offsetZ * right.y;
        if (Math.abs(lateral) > halfWidth) continue;

        const widthFactor = 1 - Math.abs(lateral) / halfWidth;
        if (widthFactor <= 0) continue;

        const t = (along + halfLength) / (2 * halfLength);
        const targetHeight = baseHeight + deltaHeight * t;
        const index = this.indexFromGrid(xIndex, zIndex);
        const blend = 0.35 + 0.65 * widthFactor;
        const newValue = THREE.MathUtils.lerp(this.heightmap[index], targetHeight, blend);
        if (Math.abs(newValue - this.heightmap[index]) < 1e-4) {
          continue;
        }

        this.heightmap[index] = newValue;
        changed = true;
        if (xIndex < minTouchedX) minTouchedX = xIndex;
        if (xIndex > maxTouchedX) maxTouchedX = xIndex;
        if (zIndex < minTouchedZ) minTouchedZ = zIndex;
        if (zIndex > maxTouchedZ) maxTouchedZ = zIndex;
      }
    }

    if (changed) {
      this.updateGeometryVertices();
      this.dirty = true;
      const touchesLeft = minTouchedX <= 0;
      const touchesRight = maxTouchedX >= this.resolution - 1;
      const touchesTop = minTouchedZ <= 0;
      const touchesBottom = maxTouchedZ >= this.resolution - 1;
      this.manager.syncChunkBorders(this, {
        minX: Math.max(0, minTouchedX),
        maxX: Math.min(this.resolution - 1, maxTouchedX),
        minZ: Math.max(0, minTouchedZ),
        maxZ: Math.min(this.resolution - 1, maxTouchedZ),
        touchesLeft,
        touchesRight,
        touchesTop,
        touchesBottom,
      });
    }

    return changed;
  }

  getHeightAt(worldPoint) {
    const grid = this.worldToGrid(worldPoint);
    if (!grid) return 0;

    const x0 = Math.floor(grid.x);
    const z0 = Math.floor(grid.z);
    const x1 = Math.min(this.resolution - 1, x0 + 1);
    const z1 = Math.min(this.resolution - 1, z0 + 1);

    const sx = grid.x - x0;
    const sz = grid.z - z0;

    const h00 = this.heightmap[this.indexFromGrid(x0, z0)];
    const h10 = this.heightmap[this.indexFromGrid(x1, z0)];
    const h01 = this.heightmap[this.indexFromGrid(x0, z1)];
    const h11 = this.heightmap[this.indexFromGrid(x1, z1)];

    const h0 = THREE.MathUtils.lerp(h00, h10, sx);
    const h1 = THREE.MathUtils.lerp(h01, h11, sx);
    return THREE.MathUtils.lerp(h0, h1, sz);
  }
}

export class TerrainManager {
  constructor({
    tileSize = DEFAULT_TILE_SIZE,
    resolution = DEFAULT_RESOLUTION,
    viewDistance = DEFAULT_VIEW_DISTANCE,
    getStorageKey,
  } = {}) {
    this.tileSize = tileSize;
    this.resolution = resolution;
    this.viewDistance = viewDistance;
    this.getStorageKey = getStorageKey;

    this.scene = null;
    this.chunks = new Map();
    this.dirtyChunks = new Set();
    this.lastCameraPosition = new THREE.Vector3();
    
    // Sdílené textury pro všechny chunky
    this.grassTexture = null;
    this.rockTexture = null;
    this.sandTexture = null;
    this.snowTexture = null;
    this.concreteTexture = null;
    this.iceTexture = null;
  }

  initialize(scene) {
    this.scene = scene;
    this.updateVisibleChunks(this.lastCameraPosition);
  }

  disposeChunks() {
    this.chunks.forEach((chunk) => chunk.dispose());
    this.chunks.clear();
    this.dirtyChunks.clear();
  }

  dispose() {
    this.disposeChunks();
    this.scene = null;
  }

  getChunkKey(tileX, tileZ) {
    return `${tileX}:${tileZ}`;
  }

  ensureChunk(tileX, tileZ) {
    const key = this.getChunkKey(tileX, tileZ);
    if (this.chunks.has(key)) {
      return this.chunks.get(key);
    }
    if (!this.scene) return null;
    const chunk = new TerrainChunk(this, tileX, tileZ);
    this.chunks.set(key, chunk);
    return chunk;
  }

  updateVisibleChunks(cameraPosition = this.lastCameraPosition) {
    if (!cameraPosition || !this.scene) return;
    this.lastCameraPosition.copy(cameraPosition);

    const currentTileX = Math.floor((cameraPosition.x + this.tileSize / 2) / this.tileSize);
    const currentTileZ = Math.floor((cameraPosition.z + this.tileSize / 2) / this.tileSize);

    const neededKeys = new Set();

    for (let dz = -this.viewDistance; dz <= this.viewDistance; dz++) {
      for (let dx = -this.viewDistance; dx <= this.viewDistance; dx++) {
        const tileX = currentTileX + dx;
        const tileZ = currentTileZ + dz;
        const chunk = this.ensureChunk(tileX, tileZ);
        if (chunk) {
          neededKeys.add(chunk.key);
        }
      }
    }

    this.chunks.forEach((chunk, key) => {
      if (!neededKeys.has(key)) {
        chunk.dispose();
        this.chunks.delete(key);
        this.dirtyChunks.delete(chunk);
      }
    });
  }

  applyBrush(worldPoint, options = {}) {
    if (!worldPoint) return;
    const radius = options.radius ?? 5;
    const minTileX = Math.floor((worldPoint.x - radius + this.tileSize / 2) / this.tileSize);
    const maxTileX = Math.floor((worldPoint.x + radius + this.tileSize / 2) / this.tileSize);
    const minTileZ = Math.floor((worldPoint.z - radius + this.tileSize / 2) / this.tileSize);
    const maxTileZ = Math.floor((worldPoint.z + radius + this.tileSize / 2) / this.tileSize);

    for (let tileZ = minTileZ; tileZ <= maxTileZ; tileZ++) {
      for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        const chunk = this.ensureChunk(tileX, tileZ);
        if (!chunk) continue;
        const changed = chunk.applyBrush(worldPoint, options);
        if (changed) {
          this.dirtyChunks.add(chunk);
        }
      }
    }
  }

  applySurfaceBrush(worldPoint, options = {}) {
    if (!worldPoint) return;
    const radius = options.radius ?? 5;
    const minTileX = Math.floor((worldPoint.x - radius + this.tileSize / 2) / this.tileSize);
    const maxTileX = Math.floor((worldPoint.x + radius + this.tileSize / 2) / this.tileSize);
    const minTileZ = Math.floor((worldPoint.z - radius + this.tileSize / 2) / this.tileSize);
    const maxTileZ = Math.floor((worldPoint.z + radius + this.tileSize / 2) / this.tileSize);

    for (let tileZ = minTileZ; tileZ <= maxTileZ; tileZ++) {
      for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        const chunk = this.ensureChunk(tileX, tileZ);
        if (!chunk) continue;
        const changed = chunk.applySurfaceBrush(worldPoint, options);
        if (changed) {
          this.dirtyChunks.add(chunk);
        }
      }
    }
  }

  applySlopeForTrack({ center, length, width, rotation = 0, slopePercent = 0, baseHeight, directionVector = null }) {
    if (!center || !Number.isFinite(length) || !Number.isFinite(width)) return;
    if (length <= 0 || width <= 0) return;
    if (!Number.isFinite(slopePercent) || Math.abs(slopePercent) < 0.0001) return;

    const halfLength = length / 2;
    const halfWidth = width / 2;
    const deltaHeight = (slopePercent / 100) * length;
    if (Math.abs(deltaHeight) < 1e-4) return;

    let direction = directionVector
      ? new THREE.Vector2(directionVector.x, directionVector.z)
      : new THREE.Vector2(Math.cos(rotation), Math.sin(rotation));
    if (direction.lengthSq() === 0) {
      direction.set(1, 0);
    } else {
      direction.normalize();
    }
    const right = new THREE.Vector2(-direction.y, direction.x);

    const centerVec = new THREE.Vector3(center.x, 0, center.z);
    const startPoint = new THREE.Vector3(
      center.x - direction.x * halfLength,
      0,
      center.z - direction.y * halfLength
    );
    const base = Number.isFinite(baseHeight) ? baseHeight : this.getHeightAt(startPoint);

    const boundingRadius = Math.sqrt(halfLength * halfLength + halfWidth * halfWidth);
    const minTileX = Math.floor((center.x - boundingRadius + this.tileSize / 2) / this.tileSize);
    const maxTileX = Math.floor((center.x + boundingRadius + this.tileSize / 2) / this.tileSize);
    const minTileZ = Math.floor((center.z - boundingRadius + this.tileSize / 2) / this.tileSize);
    const maxTileZ = Math.floor((center.z + boundingRadius + this.tileSize / 2) / this.tileSize);

    for (let tileZ = minTileZ; tileZ <= maxTileZ; tileZ++) {
      for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        const chunk = this.ensureChunk(tileX, tileZ);
        if (!chunk) continue;
        const changed = chunk.applySlopeBand({
          center: centerVec,
          direction,
          right,
          halfLength,
          halfWidth,
          baseHeight: base,
          deltaHeight
        });
        if (changed) {
          this.dirtyChunks.add(chunk);
        }
      }
    }
  }

  getHeightAt(worldPoint) {
    if (!worldPoint) return 0;
    const tileX = Math.floor((worldPoint.x + this.tileSize / 2) / this.tileSize);
    const tileZ = Math.floor((worldPoint.z + this.tileSize / 2) / this.tileSize);
    const chunk = this.ensureChunk(tileX, tileZ);
    if (!chunk) return 0;
    return chunk.getHeightAt(worldPoint);
  }

  getMeshes() {
    const meshes = [];
    this.chunks.forEach((chunk) => {
      if (chunk.mesh) {
        meshes.push(chunk.mesh);
      }
    });
    return meshes;
  }

  syncChunkBorders(chunk, { minX, maxX, minZ, maxZ, touchesLeft, touchesRight, touchesTop, touchesBottom }) {
    const res = this.resolution;
    if (touchesLeft) {
      const neighbor = this.ensureChunk(chunk.tileX - 1, chunk.tileZ);
      if (neighbor) {
        const startZ = Math.max(0, minZ);
        const endZ = Math.min(res - 1, maxZ);
        for (let z = startZ; z <= endZ; z++) {
          const value = chunk.heightmap[chunk.indexFromGrid(0, z)];
          neighbor.heightmap[neighbor.indexFromGrid(res - 1, z)] = value;
        }
        neighbor.updateGeometryVertices();
        neighbor.dirty = true;
        this.dirtyChunks.add(neighbor);
      }
    }

    if (touchesRight) {
      const neighbor = this.ensureChunk(chunk.tileX + 1, chunk.tileZ);
      if (neighbor) {
        const startZ = Math.max(0, minZ);
        const endZ = Math.min(res - 1, maxZ);
        for (let z = startZ; z <= endZ; z++) {
          const value = chunk.heightmap[chunk.indexFromGrid(res - 1, z)];
          neighbor.heightmap[neighbor.indexFromGrid(0, z)] = value;
        }
        neighbor.updateGeometryVertices();
        neighbor.dirty = true;
        this.dirtyChunks.add(neighbor);
      }
    }

    if (touchesTop) {
      const neighbor = this.ensureChunk(chunk.tileX, chunk.tileZ - 1);
      if (neighbor) {
        const startX = Math.max(0, minX);
        const endX = Math.min(res - 1, maxX);
        for (let x = startX; x <= endX; x++) {
          const value = chunk.heightmap[chunk.indexFromGrid(x, 0)];
          neighbor.heightmap[neighbor.indexFromGrid(x, res - 1)] = value;
        }
        neighbor.updateGeometryVertices();
        neighbor.dirty = true;
        this.dirtyChunks.add(neighbor);
      }
    }

    if (touchesBottom) {
      const neighbor = this.ensureChunk(chunk.tileX, chunk.tileZ + 1);
      if (neighbor) {
        const startX = Math.max(0, minX);
        const endX = Math.min(res - 1, maxX);
        for (let x = startX; x <= endX; x++) {
          const value = chunk.heightmap[chunk.indexFromGrid(x, res - 1)];
          neighbor.heightmap[neighbor.indexFromGrid(x, 0)] = value;
        }
        neighbor.updateGeometryVertices();
        neighbor.dirty = true;
        this.dirtyChunks.add(neighbor);
      }
    }
  }

  saveDirtyChunks() {
    this.dirtyChunks.forEach((chunk) => {
      chunk.saveToStorage();
    });
    this.dirtyChunks.clear();
  }

  handleSlotChange(cameraPosition) {
    this.disposeChunks();
    if (this.scene) {
      this.updateVisibleChunks(cameraPosition || new THREE.Vector3());
    }
  }
}

