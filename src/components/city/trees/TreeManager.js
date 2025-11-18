import * as THREE from 'three';

// LOD vzdálenosti - zvýšeno pro lepší dohled
const LOD_DISTANCES = {
  BILLBOARD: 500,  // Více než 500 jednotek - billboardy (zvýšeno z 200)
  SIMPLE: 200,     // 200-500 jednotek - jednoduché geometrie (zvýšeno z 100)
  DETAILED: 200    // Méně než 200 jednotek - detailní modely (zvýšeno z 100)
};

class TreeManager {
  constructor({ scene, camera, getTerrainHeightAt, getStorageKey }) {
    this.scene = scene;
    this.camera = camera;
    this.getTerrainHeightAt = getTerrainHeightAt;
    this.getStorageKey = getStorageKey;
    
    this.trees = new Map(); // Map<id, treeData>
    this.treeMeshes = new Map(); // Map<id, THREE.Object3D>
    this.treeIdCounter = 0;
    
    // LOD skupiny
    this.billboardGroup = new THREE.Group();
    this.simpleGroup = new THREE.Group();
    this.detailedGroup = new THREE.Group();
    this.scene.add(this.billboardGroup);
    this.scene.add(this.simpleGroup);
    this.scene.add(this.detailedGroup);
    
    // Frustum culling
    this.frustum = new THREE.Frustum();
    this.matrix = new THREE.Matrix4();
    
    // Cache pro billboardy
    this.billboardCache = new Map();
    
    // Optimalizace LOD - cache pro vzdálenosti
    this.lastCameraPosition = new THREE.Vector3();
    this.lastLODUpdate = 0;
    this.lodUpdateInterval = 5; // Aktualizovat LOD každých 5 frameů
    this.maxLODUpdateTime = 5; // Maximálně 5ms na aktualizaci LOD
    this.pendingLODUpdates = new Set(); // Stromy, které ještě potřebují aktualizaci LOD
  }

  /**
   * Vytvoří jehličnatý strom
   */
  createConiferTree({ position, height = 8, crownWidth = 4, trunkHeight = 3, trunkWidth = 0.3, color = 0x2d5016 }) {
    const group = new THREE.Group();
    
    // Kmen
    const trunkGeometry = new THREE.CylinderGeometry(trunkWidth, trunkWidth * 1.2, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);
    
    // Koruna - více vrstev kuželů
    const crownLayers = 3;
    for (let i = 0; i < crownLayers; i++) {
      const layerHeight = (height - trunkHeight) / crownLayers;
      const layerWidth = crownWidth * (1 - i * 0.3);
      const layerGeometry = new THREE.ConeGeometry(layerWidth, layerHeight, 8);
      const layerMaterial = new THREE.MeshStandardMaterial({ color, flatShading: true });
      const layer = new THREE.Mesh(layerGeometry, layerMaterial);
      layer.position.y = trunkHeight + (i * layerHeight) + layerHeight / 2;
      layer.castShadow = true;
      layer.receiveShadow = true;
      group.add(layer);
    }
    
    group.position.copy(position);
    group.userData.type = 'conifer';
    group.userData.height = height;
    group.userData.crownWidth = crownWidth;
    group.userData.color = color;
    
    return group;
  }

  /**
   * Vytvoří listnatý strom
   */
  createDeciduousTree({ position, height = 6, crownWidth = 5, trunkHeight = 2.5, trunkWidth = 0.4, color = 0x4a7c26 }) {
    const group = new THREE.Group();
    
    // Kmen
    const trunkGeometry = new THREE.CylinderGeometry(trunkWidth, trunkWidth * 1.3, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5a4a3a });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);
    
    // Koruna - elipsoid
    const crownGeometry = new THREE.SphereGeometry(crownWidth / 2, 12, 8);
    const crownMaterial = new THREE.MeshStandardMaterial({ color, flatShading: true });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.scale.y = 1.2; // Trochu protáhnout vertikálně
    crown.position.y = trunkHeight + crownWidth / 2;
    crown.castShadow = true;
    crown.receiveShadow = true;
    group.add(crown);
    
    group.position.copy(position);
    group.userData.type = 'deciduous';
    group.userData.height = height;
    group.userData.crownWidth = crownWidth;
    group.userData.color = color;
    
    return group;
  }

  /**
   * Vytvoří jednoduchý billboard pro vzdálené stromy
   */
  createBillboard({ type, color }) {
    const cacheKey = `${type}-${color}`;
    if (this.billboardCache.has(cacheKey)) {
      return this.billboardCache.get(cacheKey).clone();
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Pozadí transparentní
    ctx.clearRect(0, 0, 128, 256);
    
    // Kmen
    ctx.fillStyle = type === 'conifer' ? '#4a3728' : '#5a4a3a';
    const trunkWidth = 20;
    const trunkHeight = 80;
    ctx.fillRect((128 - trunkWidth) / 2, 0, trunkWidth, trunkHeight);
    
    // Koruna
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    ctx.fillStyle = colorHex;
    
    if (type === 'conifer') {
      // Jehličnatý - trojúhelník
      ctx.beginPath();
      ctx.moveTo(64, trunkHeight);
      ctx.lineTo(20, trunkHeight + 100);
      ctx.lineTo(108, trunkHeight + 100);
      ctx.closePath();
      ctx.fill();
    } else {
      // Listnatý - elipsa
      ctx.beginPath();
      ctx.ellipse(64, trunkHeight + 60, 50, 70, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.transparent = true;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    const geometry = new THREE.PlaneGeometry(4, 8);
    const billboard = new THREE.Mesh(geometry, material);
    
    this.billboardCache.set(cacheKey, billboard);
    return billboard.clone();
  }

  /**
   * Přidá strom na pozici
   */
  addTree({ type, position, height, crownWidth, color, id = null }) {
    const treeId = id || `tree_${this.treeIdCounter++}`;
    const terrainHeight = this.getTerrainHeightAt ? this.getTerrainHeightAt(position) : 0;
    const finalPosition = new THREE.Vector3(position.x, position.y || terrainHeight, position.z);
    
    const treeData = {
      id: treeId,
      type,
      position: finalPosition, // Uložit jako THREE.Vector3
      height: height || (type === 'conifer' ? 8 : 6),
      crownWidth: crownWidth || (type === 'conifer' ? 4 : 5),
      color: color || (type === 'conifer' ? 0x2d5016 : 0x4a7c26),
    };
    
    // Zajistit, že position je vždy THREE.Vector3
    if (!(treeData.position instanceof THREE.Vector3)) {
      treeData.position = new THREE.Vector3(
        treeData.position.x || 0,
        treeData.position.y || 0,
        treeData.position.z || 0
      );
    }
    
    this.trees.set(treeId, treeData);
    
    // Vytvořit detailní model
    let treeMesh;
    if (type === 'conifer') {
      treeMesh = this.createConiferTree(treeData);
    } else {
      treeMesh = this.createDeciduousTree(treeData);
    }
    
    treeMesh.userData.treeId = treeId;
    treeMesh.userData.lodLevel = 'detailed';
    this.treeMeshes.set(treeId, treeMesh);
    this.detailedGroup.add(treeMesh);
    
    if (!id) {
      this.saveTrees();
    }
    return treeId;
  }

  /**
   * Aktualizuje LOD podle vzdálenosti od kamery (optimalizováno pro výkon)
   */
  updateLOD(frameCount = 0) {
    if (!this.camera || !this.camera.position) return;
    
    const cameraPos = this.camera.position;
    
    // Throttling - aktualizovat jen každých N frameů nebo když se kamera výrazně posunula
    const cameraMoved = cameraPos.distanceTo(this.lastCameraPosition) > 10; // Více než 10 jednotek
    const shouldUpdate = (frameCount % this.lodUpdateInterval === 0) || cameraMoved;
    
    if (!shouldUpdate && this.pendingLODUpdates.size === 0) {
      // Aktualizovat jen rotaci billboardů (rychlé)
      this.billboardGroup.children.forEach(billboard => {
        if (billboard.lookAt) {
          billboard.lookAt(cameraPos);
        }
      });
      return;
    }
    
    // Aktualizovat pozici kamery
    this.lastCameraPosition.copy(cameraPos);
    
    // Aktualizovat frustum pro culling
    this.matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.matrix);
    
    const startTime = performance.now();
    const treesToUpdate = this.pendingLODUpdates.size > 0 
      ? Array.from(this.pendingLODUpdates) 
      : Array.from(this.trees.keys());
    
    this.pendingLODUpdates.clear();
    
    // Aktualizovat stromy s časovým limitem
    for (let i = 0; i < treesToUpdate.length; i++) {
      const id = treesToUpdate[i];
      const treeData = this.trees.get(id);
      if (!treeData) continue;
      
      // Kontrola časového limitu
      if (performance.now() - startTime > this.maxLODUpdateTime) {
        // Uložit zbývající stromy pro příští aktualizaci
        for (let j = i; j < treesToUpdate.length; j++) {
          this.pendingLODUpdates.add(treesToUpdate[j]);
        }
        break;
      }
      
      // Zajistit, že position je THREE.Vector3
      let treePosition;
      if (treeData.position instanceof THREE.Vector3) {
        treePosition = treeData.position;
      } else if (treeData.position && typeof treeData.position.x === 'number') {
        treePosition = new THREE.Vector3(treeData.position.x, treeData.position.y, treeData.position.z);
      } else {
        console.warn('Invalid tree position:', treeData.position);
        continue;
      }
      
      const distance = cameraPos.distanceTo(treePosition);
      const treeMesh = this.treeMeshes.get(id);
      if (!treeMesh) continue;
      
      // Frustum culling
      const sphere = new THREE.Sphere(treePosition, treeData.height);
      if (!this.frustum.intersectsSphere(sphere)) {
        // Strom je mimo pohled - skrýt všechny LOD verze
        if (treeMesh.parent) treeMesh.parent.remove(treeMesh);
        continue;
      }
      
      // Určit správnou LOD úroveň
      let targetGroup;
      let needsUpdate = false;
      
      if (distance > LOD_DISTANCES.BILLBOARD) {
        // Billboard
        targetGroup = this.billboardGroup;
        if (treeMesh.userData.lodLevel !== 'billboard') {
          needsUpdate = true;
        } else {
          // Aktualizovat rotaci billboardu
          treeMesh.lookAt(cameraPos);
        }
      } else if (distance > LOD_DISTANCES.SIMPLE) {
        // Jednoduchá geometrie
        targetGroup = this.simpleGroup;
        if (treeMesh.userData.lodLevel !== 'simple' && treeMesh.userData.lodLevel !== 'detailed') {
          needsUpdate = true;
        }
      } else {
        // Detailní model
        targetGroup = this.detailedGroup;
        if (treeMesh.userData.lodLevel !== 'detailed' && treeMesh.userData.lodLevel !== 'simple') {
          needsUpdate = true;
        }
      }
      
      // Pokud potřebujeme aktualizovat LOD, vytvořit nový mesh
      if (needsUpdate) {
        // Odstranit starý mesh
        if (treeMesh.parent) {
          treeMesh.parent.remove(treeMesh);
        }
        // Dispose starého meshe
        if (treeMesh.geometry) treeMesh.geometry.dispose();
        if (treeMesh.material) {
          if (Array.isArray(treeMesh.material)) {
            treeMesh.material.forEach(m => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (treeMesh.material.map) treeMesh.material.map.dispose();
            treeMesh.material.dispose();
          }
        }
        
        // Vytvořit nový mesh podle LOD úrovně
        let newMesh;
        if (distance > LOD_DISTANCES.BILLBOARD) {
          newMesh = this.createBillboard({ type: treeData.type, color: treeData.color });
          newMesh.position.copy(treePosition);
          newMesh.lookAt(cameraPos);
          newMesh.userData.lodLevel = 'billboard';
        } else {
          // Pro simple i detailed použijeme stejný model
          const treeDataWithPosition = { ...treeData, position: treePosition };
          if (treeData.type === 'conifer') {
            newMesh = this.createConiferTree(treeDataWithPosition);
          } else {
            newMesh = this.createDeciduousTree(treeDataWithPosition);
          }
          newMesh.userData.lodLevel = distance > LOD_DISTANCES.SIMPLE ? 'simple' : 'detailed';
        }
        newMesh.userData.treeId = id;
        this.treeMeshes.set(id, newMesh);
        targetGroup.add(newMesh);
      }
    }
  }

  /**
   * Odstraní strom
   */
  removeTree(id) {
    const treeMesh = this.treeMeshes.get(id);
    if (treeMesh && treeMesh.parent) {
      treeMesh.parent.remove(treeMesh);
      if (treeMesh.geometry) treeMesh.geometry.dispose();
      if (treeMesh.material) {
        if (Array.isArray(treeMesh.material)) {
          treeMesh.material.forEach(m => m.dispose());
        } else {
          treeMesh.material.dispose();
        }
      }
    }
    this.trees.delete(id);
    this.treeMeshes.delete(id);
    this.saveTrees();
  }

  /**
   * Uloží stromy do localStorage
   */
  saveTrees() {
    const storageKey = this.getStorageKey ? `${this.getStorageKey()}:trees` : 'cityTrees';
    const treesArray = Array.from(this.trees.values()).map(tree => {
      // Zajistit, že position má x, y, z
      const pos = tree.position instanceof THREE.Vector3 
        ? tree.position 
        : new THREE.Vector3(tree.position?.x || 0, tree.position?.y || 0, tree.position?.z || 0);
      
      return {
        id: tree.id,
        type: tree.type,
        position: { x: pos.x, y: pos.y, z: pos.z },
        height: tree.height,
        crownWidth: tree.crownWidth,
        color: tree.color,
      };
    });
    try {
      localStorage.setItem(storageKey, JSON.stringify(treesArray));
    } catch (error) {
      console.error('Chyba při ukládání stromů:', error);
    }
  }

  /**
   * Načte stromy z localStorage
   */
  loadTrees() {
    const storageKey = this.getStorageKey ? `${this.getStorageKey()}:trees` : 'cityTrees';
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      
      const treesArray = JSON.parse(saved);
      treesArray.forEach(treeData => {
        const position = new THREE.Vector3(treeData.position.x, treeData.position.y, treeData.position.z);
        this.addTree({
          id: treeData.id,
          type: treeData.type,
          position,
          height: treeData.height,
          crownWidth: treeData.crownWidth,
          color: treeData.color,
        });
      });
      
      // Aktualizovat LOD po načtení
      this.updateLOD();
    } catch (error) {
      console.error('Chyba při načítání stromů:', error);
    }
  }

  /**
   * Vymaže všechny stromy
   */
  clearAll() {
    this.trees.forEach((_, id) => this.removeTree(id));
  }

  /**
   * Dispose všech zdrojů
   */
  dispose() {
    this.clearAll();
    this.billboardCache.forEach(billboard => {
      if (billboard.geometry) billboard.geometry.dispose();
      if (billboard.material) {
        if (billboard.material.map) billboard.material.map.dispose();
        billboard.material.dispose();
      }
    });
    this.billboardCache.clear();
  }
}

export default TreeManager;

